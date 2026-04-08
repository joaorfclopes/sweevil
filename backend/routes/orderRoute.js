import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { isAdmin, isAuth } from "../utils.js";

const orderRouter = express.Router();

orderRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate("user", "name");
    res.send(orders);
  })
);

orderRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: "Order deleted", order });
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);

orderRouter.put(
  "/:id/send",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isSent = true;
      order.sentAt = Date.now();
      order.status = "SENT";
      const updatedOrder = await order.save();
      res.send({ message: "Order sent", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);

orderRouter.put(
  "/:id/deliver",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = "DELIVERED";
      const updatedOrder = await order.save();
      res.send({ message: "Order delivered", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);

orderRouter.get(
  "/list",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.post(
  "/",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { orderItems, shippingAddress } = req.body;
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).send({ message: "Cart is empty" });
    }
    const builtItems = [];
    for (const item of orderItems) {
      const qty = item.qty;
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).send({ message: "Invalid quantity" });
      }
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).send({ message: "Product not found" });
      }
      builtItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0],
        price: product.price,
        isClothing: product.isClothing,
        qty,
        size: item.size,
      });
    }
    const itemsPrice = parseFloat(
      builtItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(2)
    );
    const shippingPrice = parseFloat(
      (itemsPrice >= 40 ? 0 : 9.99).toFixed(2)
    );
    const totalPrice = parseFloat((itemsPrice + shippingPrice).toFixed(2));
    const itemsQty = builtItems.reduce((a, c) => a + c.qty, 0);
    const order = new Order({
      orderItems: builtItems,
      shippingAddress,
      itemsQty,
      itemsPrice,
      shippingPrice,
      totalPrice,
      status: "IN PROGRESS",
      user: req.user._id,
    });
    const createdOrder = await order.save();
    res.status(201).send({ message: "New order created", order: createdOrder });
  })
);

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      // Only the order owner or an admin may view the order
      if (!req.user.isAdmin && order.user?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  })
);

orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      // Only the order owner may mark it as paid
      if (order.user?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
      order.isPaid = true;
      order.paidAt = Date.now();
      order.status = "PAID";
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      order.orderItems.forEach(async (item) => {
        const product = await Product.findById(item.product);
        if (!product.isClothing) {
          product.countInStock.stock = product.countInStock.stock - item.qty;
        } else {
          item.size === "XS"
            ? (product.countInStock.xs = product.countInStock.xs - item.qty)
            : item.size === "S"
            ? (product.countInStock.s = product.countInStock.s - item.qty)
            : item.size === "M"
            ? (product.countInStock.m = product.countInStock.m - item.qty)
            : item.size === "L"
            ? (product.countInStock.l = product.countInStock.l - item.qty)
            : item.size === "XL"
            ? (product.countInStock.xl = product.countInStock.xl - item.qty)
            : item.size === "XXL" &&
              (product.countInStock.xxl = product.countInStock.xxl - item.qty);
        }
        // eslint-disable-next-line no-unused-vars
        const updatedProduct = await product.save();
      });
      const updatedOrder = await order.save();
      res.send({ message: "Order paid", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);

orderRouter.put(
  "/:id/cancel",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      // Only the order owner or an admin may cancel the order
      if (!req.user.isAdmin && order.user?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
      order.status = "CANCELED";
      if (order.isPaid) {
        order.orderItems.forEach(async (item) => {
          const product = await Product.findById(item.product);
          if (!product.isClothing) {
            product.countInStock.stock = product.countInStock.stock + item.qty;
          } else {
            item.size === "XS"
              ? (product.countInStock.xs = product.countInStock.xs + item.qty)
              : item.size === "S"
              ? (product.countInStock.s = product.countInStock.s + item.qty)
              : item.size === "M"
              ? (product.countInStock.m = product.countInStock.m + item.qty)
              : item.size === "L"
              ? (product.countInStock.l = product.countInStock.l + item.qty)
              : item.size === "XL"
              ? (product.countInStock.xl = product.countInStock.xl + item.qty)
              : item.size === "XXL" &&
                (product.countInStock.xxl =
                  product.countInStock.xxl + item.qty);
          }
          // eslint-disable-next-line no-unused-vars
          const updatedProduct = await product.save();
        });
      }
      const updatedOrder = await order.save();
      res.send({ message: "Order canceled", order: updatedOrder });
    } else {
      res.status(404).send({ message: "Order not found" });
    }
  })
);

export default orderRouter;
