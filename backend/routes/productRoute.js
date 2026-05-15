import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
import { deleteAllFromS3 } from '../s3.js';
import { isAdmin, isAuth, optionalAuth } from '../utils.js';

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
      const products = await Product.find({});
      return res.send(products);
    }
    const products = await Product.find({ visible: true });
    res.send(products.map(toPublic));
  })
);

productRouter.get(
  '/:id',
  optionalAuth,
  expressAsyncHandler(async (req, res) => {
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
    res.json(toPublic(product));
  })
);

productRouter.post(
  '/',
  isAuth,
  isAdmin,
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
    console.log(`[product] Created "${createdProduct.name}" (${createdProduct._id}) — €${createdProduct.price}, visible: ${createdProduct.visible}`);
    res.send({ message: 'Product created', product: createdProduct });
  })
);

productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
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
      console.log(`[product] Updated "${updatedProduct.name}" (${updatedProduct._id}) — €${updatedProduct.price}, visible: ${updatedProduct.visible}`);
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
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      await deleteAllFromS3(product.images);
      console.log(`[product] Deleted "${product.name}" (${product._id})`);
      res.send({ message: 'Product deleted', product });
    } else {
      res.status(404).send({ message: 'Product not Found' });
    }
  })
);

export default productRouter;
