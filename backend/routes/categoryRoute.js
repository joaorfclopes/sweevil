import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { cacheDel, cacheGet, cacheSet } from '../cache.js';
import Category from '../models/categoryModel.js';
import GalleryImage from '../models/galleryImageModel.js';
import { isAdmin, isAuth } from '../utils.js';

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Gallery category management
 */

const categoryRouter = express.Router();
const CACHE_KEY = 'categories:list';
const TTL = 60 * 30;

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all gallery categories sorted by order
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of categories
 */
categoryRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) return res.json(cached);
    const categories = await Category.find({}).sort({ order: 1, name: 1 });
    await cacheSet(CACHE_KEY, categories, TTL);
    res.json(categories);
  })
);

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a new gallery category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Invalid name or category already exists
 */
categoryRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, nameEn, namePt } = req.body;
    if (typeof name !== 'string') {
      res.status(400).json({ message: 'Name must be a string' });
      return;
    }
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }
    const category = new Category({
      name: name.trim(),
      nameEn: nameEn?.trim(),
      namePt: namePt?.trim(),
    });
    const created = await category.save();
    await cacheDel(CACHE_KEY);
    res.status(201).json(created);
  })
);

/**
 * @swagger
 * /categories/reorder:
 *   patch:
 *     summary: Bulk-update gallery category display order
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [_id, order]
 *                   properties:
 *                     _id: { type: string }
 *                     order: { type: integer }
 *     responses:
 *       200:
 *         description: Order updated
 *       400:
 *         description: Items must be an array
 */
categoryRouter.patch(
  '/reorder',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { items } = req.body; // [{ _id, order }]
    if (!Array.isArray(items)) {
      res.status(400).json({ message: 'Items must be an array' });
      return;
    }
    await Promise.all(items.map(({ _id, order }) => Category.findByIdAndUpdate(_id, { order })));
    await cacheDel(CACHE_KEY);
    res.json({ message: 'Order updated' });
  })
);

/**
 * @swagger
 * /categories/{id}:
 *   put:
 *     summary: Rename a gallery category (also updates all images using the old name)
 *     tags: [Categories]
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
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Invalid name
 *       404:
 *         description: Category not found
 */
categoryRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { name, nameEn, namePt } = req.body;
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ message: 'Name must be a non-empty string' });
      return;
    }
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    const oldName = category.name;
    const newName = name.trim();
    category.name = newName;
    if (nameEn !== undefined) category.nameEn = nameEn?.trim() || undefined;
    if (namePt !== undefined) category.namePt = namePt?.trim() || undefined;
    const updated = await category.save();
    await GalleryImage.updateMany({ category: oldName }, { category: newName });
    await cacheDel(CACHE_KEY);
    res.json(updated);
  })
);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete a gallery category (blocked if any images use it)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Category deleted
 *       400:
 *         description: Category is in use by one or more images
 *       404:
 *         description: Category not found
 */
categoryRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    const inUse = await GalleryImage.exists({ category: category.name });
    if (inUse) {
      res.status(400).json({ message: 'Category is in use by one or more images' });
      return;
    }
    await category.deleteOne();
    await cacheDel(CACHE_KEY);
    res.json({ message: 'Category deleted' });
  })
);

export default categoryRouter;
