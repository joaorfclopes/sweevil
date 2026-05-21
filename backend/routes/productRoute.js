import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { cacheDel, cacheGet, cacheSet } from '../cache.js';
import Product from '../models/productModel.js';
import { deleteAllFromS3 } from '../s3.js';
import { isAdmin, isAuth, optionalAuth } from '../utils.js';
import { productSchema, validate } from '../validation.js';

const LIST_KEY = 'products:list';
const itemKey = (id) => `products:${id}`;
const TTL = 60 * 5;

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product catalogue management
 */

const productRouter = express.Router();

// Cap each stock value at 5 and strip internal fields from public responses
const toPublic = (product) => {
  const { __v, createdAt, updatedAt, visible, countInStock, ...rest } = product.toObject();
  const cap = (val) => Math.min(val ?? 0, 5);
  const stock = rest.isClothing
    ? {
        xs: cap(countInStock?.xs),
        s: cap(countInStock?.s),
        m: cap(countInStock?.m),
        l: cap(countInStock?.l),
        xl: cap(countInStock?.xl),
        xxl: cap(countInStock?.xxl),
      }
    : { stock: cap(countInStock?.stock) };
  return { ...rest, countInStock: stock };
};

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products (public — visible only; admin gets all with pagination/search)
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Admin only
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *         description: Admin only
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Admin only — filter by product name
 *       - in: query
 *         name: all
 *         schema: { type: string, enum: [true] }
 *         description: Admin only — return all products without pagination
 *     responses:
 *       200:
 *         description: Array of products (public) or paginated result (admin)
 */
productRouter.get(
  '/',
  optionalAuth,
  expressAsyncHandler(async (req, res) => {
    const hasAdminParams = req.query.page || req.query.limit || req.query.search || req.query.all;
    if (req.user?.isAdmin && hasAdminParams) {
      const { search = '', all } = req.query;
      const query = {};
      if (search) query.name = { $regex: search, $options: 'i' };

      if (all === 'true') {
        const products = await Product.find(query).sort({ sortOrder: 1, _id: 1 });
        return res.json({ items: products, total: products.length, page: 1, pages: 1 });
      }

      const pageNum = Math.max(1, parseInt(req.query.page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort({ sortOrder: 1, _id: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);
      return res.json({
        items: products,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
      });
    }
    const cached = await cacheGet(LIST_KEY);
    if (cached) return res.send(cached);
    const products = await Product.find({ visible: true }).sort({ sortOrder: 1, _id: 1 });
    const result = products.map(toPublic);
    await cacheSet(LIST_KEY, result, TTL);
    res.send(result);
  })
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a single product by ID
 *     tags: [Products]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product data (stock values capped at 5 for public users)
 *       404:
 *         description: Product not found or not visible
 */
productRouter.get(
  '/:id',
  optionalAuth,
  expressAsyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Product not Found' });
    }
    if (!req.user?.isAdmin) {
      const cached = await cacheGet(itemKey(req.params.id));
      if (cached) return res.json(cached);
    }
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not Found' });
    }
    if (req.user?.isAdmin) {
      return res.json(product);
    }
    if (!product.visible) {
      return res.status(404).json({ message: 'Product not Found' });
    }
    const result = toPublic(product);
    await cacheSet(itemKey(req.params.id), result, TTL);
    res.json(result);
  })
);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, images, category, isClothing, countInStock, visible]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               originalPrice: { type: number, description: Must be greater than price if set }
 *               images: { type: array, items: { type: string } }
 *               category: { type: string }
 *               isClothing: { type: boolean }
 *               countInStock: { type: object }
 *               description: { type: string }
 *               visible: { type: boolean }
 *     responses:
 *       200:
 *         description: Product created
 *       400:
 *         description: Validation error
 */
productRouter.post(
  '/',
  isAuth,
  isAdmin,
  validate(productSchema),
  expressAsyncHandler(async (req, res) => {
    const {
      name,
      price,
      images,
      category,
      isClothing,
      countInStock,
      description,
      visible,
      originalPrice,
    } = req.body;
    if (originalPrice != null && originalPrice <= price) {
      return res
        .status(400)
        .send({ message: 'Original price must be greater than the current price.' });
    }
    const lowestProduct = await Product.findOne({}).sort({ sortOrder: 1 });
    const newSortOrder = lowestProduct ? lowestProduct.sortOrder - 1 : 0;
    const product = new Product({
      name,
      price,
      images,
      category,
      isClothing,
      countInStock,
      description,
      visible,
      originalPrice: originalPrice != null ? originalPrice : undefined,
      sortOrder: newSortOrder,
    });
    const createdProduct = await product.save();
    console.log(
      `[product] Created "${createdProduct.name}" (${createdProduct._id}) — €${createdProduct.price}, visible: ${createdProduct.visible}`
    );
    await cacheDel(LIST_KEY);
    res.send({ message: 'Product created', product: createdProduct });
  })
);

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
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
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               originalPrice: { type: number }
 *               images: { type: array, items: { type: string } }
 *               category: { type: string }
 *               isClothing: { type: boolean }
 *               countInStock: { type: object }
 *               description: { type: string }
 *               visible: { type: boolean }
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Product not found
 */
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  validate(productSchema),
  expressAsyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send({ message: 'Product not Found' });
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = req.body.name;
      product.price = req.body.price;
      product.images = req.body.images;
      product.category = req.body.category;
      product.isClothing = req.body.isClothing;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      product.visible = req.body.visible;
      const reqOriginalPrice = req.body.originalPrice;
      if (reqOriginalPrice != null && reqOriginalPrice <= req.body.price) {
        return res
          .status(400)
          .send({ message: 'Original price must be greater than the current price.' });
      }
      product.originalPrice = reqOriginalPrice != null ? reqOriginalPrice : null;
      const updatedProduct = await product.save();
      console.log(
        `[product] Updated "${updatedProduct.name}" (${updatedProduct._id}) — €${updatedProduct.price}, visible: ${updatedProduct.visible}`
      );
      await cacheDel(LIST_KEY, itemKey(req.params.id));
      res.send({ message: 'Product updated', product: updatedProduct });
    } else {
      res.status(404).send({ message: 'Product not Found' });
    }
  })
);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product and its S3 images
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 */
productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).send({ message: 'Product not Found' });
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      await deleteAllFromS3(product.images);
      console.log(`[product] Deleted "${product.name}" (${product._id})`);
      await cacheDel(LIST_KEY, itemKey(req.params.id));
      res.send({ message: 'Product deleted', product });
    } else {
      res.status(404).send({ message: 'Product not Found' });
    }
  })
);

/**
 * @swagger
 * /products/reorder:
 *   patch:
 *     summary: Bulk-update product sort order
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required: [_id, sortOrder]
 *               properties:
 *                 _id: { type: string }
 *                 sortOrder: { type: number }
 *     responses:
 *       200:
 *         description: Sort order updated
 *       400:
 *         description: Invalid body
 */
productRouter.patch(
  '/reorder',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const items = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Body must be a non-empty array' });
    }
    for (const item of items) {
      if (!mongoose.isValidObjectId(item._id) || typeof item.sortOrder !== 'number') {
        return res
          .status(400)
          .json({ message: 'Each item must have a valid _id and numeric sortOrder' });
      }
    }
    await Promise.all(
      items.map(({ _id, sortOrder }) => Product.updateOne({ _id }, { $set: { sortOrder } }))
    );
    await cacheDel(LIST_KEY);
    res.json({ message: 'Order updated' });
  })
);

export default productRouter;
