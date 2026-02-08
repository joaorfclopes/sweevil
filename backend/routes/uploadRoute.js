import express from "express";
import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const uploadRouter = express.Router();

// Configure AWS SDK v3 S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const storageS3 = multerS3({
  s3,
  bucket: "sweevil",
  acl: "public-read",
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key(req, file, cb) {
    cb(null, "store/" + file.originalname);
  },
});
const uploadS3 = multer({ storage: storageS3 });

uploadRouter.post("/s3", uploadS3.single("image"), (req, res) => {
  res.send(req.file.location);
});

export default uploadRouter;
