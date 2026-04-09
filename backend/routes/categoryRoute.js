import express from "express";
import expressAsyncHandler from "express-async-handler";
import Category from "../models/categoryModel.js";
import { isAdmin, isAuth } from "../utils.js";

const categoryRouter = express.Router();

categoryRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ name: 1 });
    res.send(categories);
  })
);

categoryRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name } = req.body;
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      res.status(400).send({ message: "Category already exists" });
      return;
    }
    const category = new Category({ name: name.trim() });
    const created = await category.save();
    res.status(201).send(created);
  })
);

categoryRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).send({ message: "Category not found" });
      return;
    }
    await category.deleteOne();
    res.send({ message: "Category deleted" });
  })
);

export default categoryRouter;
