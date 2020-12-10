import express from "express";
import expressAsyncHandler from "express-async-handler";
import Order from "../models/orderModel.js";
import User from "../models/userModel.js";
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
      const deleteOrder = await order.remove();
      res.send({ message: "Order deleted", order: deleteOrder });
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
  expressAsyncHandler(async (req, res) => {
    try {
      if (req.body.orderItems.length === 0) {
        res.status(400).send({ message: "Cart is empty" });
      } else {
        const order = new Order({
          orderItems: req.body.orderItems,
          shippingAddress: req.body.shippingAddress,
          itemsQty: req.body.itemsQty,
          subtotalPrice: req.body.subtotalPrice,
          shippingPrice: req.body.shippingPrice,
          totalPrice: req.body.totalPrice,
          status: req.body.status,
        });
        const createdOrder = await order.save();
        res
          .status(201)
          .send({ message: "New order created", order: createdOrder });
      }
    } catch (error) {
      res.status(401).send({ message: "Error creating order" });
    }
  })
);

orderRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user.isAdmin) {
      const order = await Order.findById(req.params.id);
      if (order) {
        res.send(order);
      } else {
        res.status(404).send({ message: "Order not found" });
      }
    } else {
      const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id,
      });
      if (order) {
        res.send(order);
      } else {
        res.status(404).send({ message: "Order not found" });
      }
    }
  })
);

orderRouter.put(
  "/:id/pay",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
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
        const product = await Product.findOne({
          name: item.name,
        });
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
      order.status = "CANCELED";
      if (order.isPaid) {
        order.orderItems.forEach(async (item) => {
          const product = await Product.findOne({
            name: item.name,
          });
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
