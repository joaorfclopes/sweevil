import express from "express";
import multer from "multer";
import rateLimit from "express-rate-limit";
import { S3Client, DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
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

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/tiff",
  "image/bmp",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif, avif, tiff, bmp) are allowed"), false);
  }
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

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

const bookingMemoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 },
});

uploadRouter.post("/s3", isAuth, isAdmin, (req, res, next) => {
  memoryUpload.single("image")(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    try {
      const ALLOWED_FOLDERS = ["store", "gallery"];
      const folder = ALLOWED_FOLDERS.includes(req.query.folder) ? req.query.folder : "store";
      const baseName = path
        .basename(req.file.originalname, path.extname(req.file.originalname))
        .replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `${folder}/${Date.now()}_${baseName}.avif`;

      let processed;
      if (folder === "store") {
        const SIZE = 1000;
        const bgPath = path.join(path.resolve(), "frontend", "public", "background.jpg");
        const productImg = await sharp(req.file.buffer)
          .resize({ width: SIZE, height: SIZE, fit: "inside", withoutEnlargement: true })
          .toBuffer();
        processed = await sharp(bgPath)
          .resize(SIZE, SIZE)
          .composite([{ input: productImg, gravity: "center" }])
          .avif({ quality: 80 })
          .toBuffer();
      } else {
        processed = await sharp(req.file.buffer)
          .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
          .avif({ quality: 80 })
          .toBuffer();
      }

      const s3 = makeS3Client();
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: processed,
          ContentType: "image/avif",
        })
      );

      const region = process.env.AWS_REGION || "us-east-1";
      const location = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
      res.json({ location });
    } catch (processingErr) {
      next(processingErr);
    }
  });
});

uploadRouter.post("/booking-images", bookingUploadLimiter, (req, res, next) => {
  bookingMemoryUpload.array("images", 10)(req, res, async (err) => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    try {
      const s3 = makeS3Client();
      const region = process.env.AWS_REGION || "us-east-1";
      const urls = await Promise.all(
        req.files.map(async (file) => {
          const baseName = path
            .basename(file.originalname, path.extname(file.originalname))
            .replace(/[^a-zA-Z0-9._-]/g, "_");
          const key = `bookings/${Date.now()}_${baseName}.avif`;
          const processed = await sharp(file.buffer)
            .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
            .avif({ quality: 80 })
            .toBuffer();
          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: key,
              Body: processed,
              ContentType: "image/avif",
            })
          );
          return `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
        })
      );
      res.json({ urls });
    } catch (processingErr) {
      next(processingErr);
    }
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
