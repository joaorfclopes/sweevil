import express from "express";
import expressAsyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import ProductCategory from "../models/productCategoryModel.js";
import { isAuth, isAdmin } from "../utils.js";

const productCategoryRouter = express.Router();

const DEFAULTS = [
  { name: "Prints", isClothing: false },
  { name: "Paintings", isClothing: false },
  { name: "Carpets", isClothing: false },
  { name: "T-Shirts", isClothing: true },
  { name: "Hoodies", isClothing: true },
  { name: "Wallets", isClothing: false },
  { name: "Diskettes", isClothing: false },
  { name: "Jewelry", isClothing: false },
  { name: "Bags", isClothing: false },
  { name: "Scarves", isClothing: false },
];

// Seed defaults if the collection is empty
async function seedIfEmpty() {
  const count = await ProductCategory.countDocuments();
  if (count === 0) {
    await ProductCategory.insertMany(DEFAULTS);
  }
}
seedIfEmpty().catch(console.error);

productCategoryRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const categories = await ProductCategory.find({}).sort({ name: 1 });
    res.json(categories);
  })
);

productCategoryRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, isClothing } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Name is required" });
    }
    const existing = await ProductCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const category = await ProductCategory.create({ name: name.trim(), isClothing: !!isClothing });
    res.status(201).json(category);
  })
);

productCategoryRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const inUse = await Product.exists({ category: category.name });
    if (inUse) {
      return res.status(400).json({ message: "Category is in use by one or more products" });
    }
    await category.deleteOne();
    res.json({ message: "Category deleted" });
  })
);

export default productCategoryRouter;
