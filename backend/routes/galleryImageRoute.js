import express from "express";
import expressAsyncHandler from "express-async-handler";
import data from "../data.js";
import GalleryImage from "../models/galleryImageModel.js";
import { isAuth, isAdmin } from "../utils.js";

const galleryImageRouter = express.Router();

galleryImageRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const gallery = await GalleryImage.find({});
    res.send(gallery);
  })
);

galleryImageRouter.get(
  "/seed",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const createdGallery = await GalleryImage.insertMany(data.galleryImages);
    res.send({ createdGallery });
  })
);

export default galleryImageRouter;
