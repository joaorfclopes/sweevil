import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import GalleryImage from "../models/galleryImageModel.js";
import { isAdmin, isAuth } from "../utils.js";

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
    const count = await GalleryImage.countDocuments();
    const galleryImage = new GalleryImage({
      image,
      description: description || "",
      category,
      order: count,
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
