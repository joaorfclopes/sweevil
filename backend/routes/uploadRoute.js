import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import rateLimit from "express-rate-limit";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { isAuth, isAdmin } from "../utils.js";
import path from "path";

const bookingUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many upload requests, please try again later." },
});

const uploadRouter = express.Router();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"), false);
  }
};

function makeS3Client() {
  const cfg = { region: process.env.AWS_REGION || "us-east-1" };
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    cfg.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  return new S3Client(cfg);
}

function createUpload() {
  const s3 = makeS3Client();
  const storageS3 = multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
      const ALLOWED_FOLDERS = ["store", "gallery"];
      const folder = ALLOWED_FOLDERS.includes(req.query.folder) ? req.query.folder : "store";
      const sanitized = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, folder + "/" + sanitized);
    },
  });
  return multer({ storage: storageS3, fileFilter });
}

function createBookingUpload() {
  const s3 = makeS3Client();
  const storageS3 = multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key(req, file, cb) {
      const sanitized = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `bookings/${Date.now()}_${sanitized}`);
    },
  });
  return multer({
    storage: storageS3,
    fileFilter,
    limits: { files: 10, fileSize: 5 * 1024 * 1024 },
  });
}

uploadRouter.post("/s3", isAuth, isAdmin, (req, res, next) => {
  createUpload().single("image")(req, res, (err) => {
    if (err) return next(err);
    res.json({ location: req.file.location });
  });
});

uploadRouter.post("/booking-images", bookingUploadLimiter, (req, res, next) => {
  createBookingUpload().array("images", 10)(req, res, (err) => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    res.json({ urls: req.files.map((f) => f.location) });
  });
});

uploadRouter.delete("/s3", isAuth, isAdmin, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "url is required" });
  try {
    const key = new URL(url).pathname.slice(1);
    if (!key.startsWith("store/") && !key.startsWith("gallery/")) {
      return res.status(400).json({ message: "Invalid key" });
    }
    const s3 = makeS3Client();
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default uploadRouter;
