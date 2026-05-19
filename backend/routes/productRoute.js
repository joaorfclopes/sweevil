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

productRouter.get(
  '/',
  optionalAuth,
  expressAsyncHandler(async (req, res) => {
    if (req.user?.isAdmin) {
      const pageNum = Math.max(1, parseInt(req.query.page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
      const { search = '' } = req.query;
      const query = {};
      if (search) query.name = { $regex: search, $options: 'i' };
      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .sort({ createdAt: -1 })
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
    const products = await Product.find({ visible: true });
    const result = products.map(toPublic);
    await cacheSet(LIST_KEY, result, TTL);
    res.send(result);
  })
);

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

productRouter.post(
  '/',
  isAuth,
  isAdmin,
  validate(productSchema),
  expressAsyncHandler(async (req, res) => {
    const { name, price, images, category, isClothing, countInStock, description, visible } =
      req.body;
    const product = new Product({
      name,
      price,
      images,
      category,
      isClothing,
      countInStock,
      description,
      visible,
    });
    const createdProduct = await product.save();
    console.log(
      `[product] Created "${createdProduct.name}" (${createdProduct._id}) — €${createdProduct.price}, visible: ${createdProduct.visible}`
    );
    await cacheDel(LIST_KEY);
    res.send({ message: 'Product created', product: createdProduct });
  })
);

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

export default productRouter;
