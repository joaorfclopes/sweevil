import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { cacheDel, cacheGet, cacheSet } from '../cache.js';
import ProductCategory from '../models/productCategoryModel.js';
import Product from '../models/productModel.js';
import { isAdmin, isAuth } from '../utils.js';

/**
 * @swagger
 * tags:
 *   name: ProductCategories
 *   description: Product category management
 */

const productCategoryRouter = express.Router();

const DEFAULTS = [
  { name: 'Prints', isClothing: false },
  { name: 'Paintings', isClothing: false },
  { name: 'Carpets', isClothing: false },
  { name: 'T-Shirts', isClothing: true },
  { name: 'Hoodies', isClothing: true },
  { name: 'Wallets', isClothing: false },
  { name: 'Diskettes', isClothing: false },
  { name: 'Jewelry', isClothing: false },
  { name: 'Bags', isClothing: false },
  { name: 'Scarves', isClothing: false },
];

// Seed defaults if the collection is empty
async function seedIfEmpty() {
  const count = await ProductCategory.countDocuments();
  if (count === 0) {
    await ProductCategory.insertMany(DEFAULTS);
  }
}
seedIfEmpty().catch(console.error);

const CACHE_KEY = 'productcategories:list';
const TTL = 60 * 30;

/**
 * @swagger
 * /product-categories:
 *   get:
 *     summary: List all product categories sorted alphabetically
 *     tags: [ProductCategories]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of product categories
 */
productCategoryRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) return res.json(cached);
    const categories = await ProductCategory.find({}).sort({ name: 1 });
    await cacheSet(CACHE_KEY, categories, TTL);
    res.json(categories);
  })
);

/**
 * @swagger
 * /product-categories:
 *   post:
 *     summary: Create a new product category
 *     tags: [ProductCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               isClothing: { type: boolean, default: false }
 *     responses:
 *       201:
 *         description: Product category created
 *       400:
 *         description: Invalid name or category already exists
 */
productCategoryRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, isClothing } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }
    const existing = await ProductCategory.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = await ProductCategory.create({ name: name.trim(), isClothing: !!isClothing });
    await cacheDel(CACHE_KEY);
    res.status(201).json(category);
  })
);

/**
 * @swagger
 * /product-categories/{id}:
 *   put:
 *     summary: Update a product category (also renames the category on all products)
 *     tags: [ProductCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               isClothing: { type: boolean }
 *     responses:
 *       200:
 *         description: Product category updated
 *       400:
 *         description: Invalid name or duplicate
 *       404:
 *         description: Category not found
 */
productCategoryRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, isClothing } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ message: 'Name is required' });
    }
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const duplicate = await ProductCategory.findOne({
      name: name.trim(),
      _id: { $ne: req.params.id },
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const oldName = category.name;
    category.name = name.trim();
    if (isClothing !== undefined) category.isClothing = !!isClothing;
    await category.save();
    if (oldName !== category.name) {
      await Product.updateMany({ category: oldName }, { $set: { category: category.name } });
    }
    await cacheDel(CACHE_KEY);
    res.json(category);
  })
);

/**
 * @swagger
 * /product-categories/{id}:
 *   delete:
 *     summary: Delete a product category (blocked if any products use it)
 *     tags: [ProductCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 *       400:
 *         description: Category is in use by one or more products
 *       404:
 *         description: Category not found
 */
productCategoryRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const category = await ProductCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const inUse = await Product.exists({ category: category.name });
    if (inUse) {
      return res.status(400).json({ message: 'Category is in use by one or more products' });
    }
    await category.deleteOne();
    await cacheDel(CACHE_KEY);
    res.json({ message: 'Category deleted' });
  })
);

export default productCategoryRouter;
