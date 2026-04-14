import express from "express";
import expressAsyncHandler from "express-async-handler";
import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import data from "../data.js";
import GalleryImage from "../models/galleryImageModel.js";
import { isAdmin, isAuth } from "../utils.js";

function createS3Client() {
  const config = { region: process.env.AWS_REGION || "us-east-1" };
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  return new S3Client(config);
}

function s3KeyFromUrl(url) {
  try {
    return new URL(url).pathname.slice(1); // strips leading "/"
  } catch {
    return null;
  }
}

const galleryImageRouter = express.Router();

galleryImageRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const gallery = await GalleryImage.find({}).sort({ order: 1, createdAt: 1 });
    res.json(gallery);
  })
);

galleryImageRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { image, description, category } = req.body;
    await GalleryImage.updateMany({}, { $inc: { order: 1 } });
    const galleryImage = new GalleryImage({
      image,
      description: description || "",
      category,
      order: 0,
    });
    const created = await galleryImage.save();
    res.status(201).json(created);
  })
);

galleryImageRouter.patch(
  "/reorder",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { items } = req.body; // [{ _id, order }]
    if (!Array.isArray(items)) {
      res.status(400).json({ message: "Items must be an array" });
      return;
    }
    await Promise.all(
      items.map(({ _id, order }) =>
        GalleryImage.findByIdAndUpdate(_id, { order })
      )
    );
    res.json({ message: "Order updated" });
  })
);

galleryImageRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const galleryImage = await GalleryImage.findById(req.params.id);
    if (!galleryImage) {
      res.status(404).json({ message: "Image not found" });
      return;
    }
    const { description, category } = req.body;
    galleryImage.description = description ?? galleryImage.description;
    galleryImage.category = category ?? galleryImage.category;
    const updated = await galleryImage.save();
    res.json(updated);
  })
);

galleryImageRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const galleryImage = await GalleryImage.findById(req.params.id);
    if (!galleryImage) {
      res.status(404).json({ message: "Image not found" });
      return;
    }
    await galleryImage.deleteOne();

    const key = s3KeyFromUrl(galleryImage.image);
    if (key && process.env.AWS_S3_BUCKET) {
      await createS3Client().send(
        new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
      );
    }

    res.json({ message: "Image deleted" });
  })
);

// Seed route - only available in development
if (process.env.NODE_ENV !== "production") {
  galleryImageRouter.get(
    "/seed",
    expressAsyncHandler(async (req, res) => {
      const createdGallery = await GalleryImage.insertMany(data.galleryImages);
      res.json({ createdGallery });
    })
  );
}

export default galleryImageRouter;
