import express from "express";
import expressAsyncHandler from "express-async-handler";
import GalleryImage from "../models/galleryImageModel.js";
import { isAdmin, isAuth } from "../utils.js";
import { deleteFromS3 } from "../s3.js";

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
    await deleteFromS3(galleryImage.image);
    res.json({ message: "Image deleted" });
  })
);

export default galleryImageRouter;
