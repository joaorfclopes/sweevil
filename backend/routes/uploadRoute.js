import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { isAuth, isAdmin } from "../utils.js";
import path from "path";

const uploadRouter = express.Router();

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"), false);
  }
};

function createUpload() {
  const s3ClientConfig = {
    region: process.env.AWS_REGION || "us-east-1",
  };
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    s3ClientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  const s3 = new S3Client(s3ClientConfig);

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

uploadRouter.post("/s3", isAuth, isAdmin, (req, res, next) => {
  createUpload().single("image")(req, res, (err) => {
    if (err) return next(err);
    // Wrap in JSON so the response is never served as text/html
    res.json({ location: req.file.location });
  });
});

export default uploadRouter;
