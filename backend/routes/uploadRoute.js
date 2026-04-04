import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { isAuth, isAdmin } from "../utils.js";
import path from "path";

const uploadRouter = express.Router();

// Configure AWS SDK v3 S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"), false);
  }
};

const storageS3 = multerS3({
  s3,
  bucket: "sweevil",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(req, file, cb) {
    const sanitized = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, "store/" + sanitized);
  },
});
const uploadS3 = multer({ storage: storageS3, fileFilter });

uploadRouter.post("/s3", isAuth, isAdmin, uploadS3.single("image"), (req, res) => {
  // Wrap in JSON so the response is never served as text/html
  res.json({ location: req.file.location });
});

export default uploadRouter;
