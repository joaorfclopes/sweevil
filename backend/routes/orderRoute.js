import crypto from "crypto";
import express from "express";
import expressAsyncHandler from "express-async-handler";
import rateLimit from "express-rate-limit";
import Stripe from "stripe";
import { fromNodeHeaders } from "better-auth/node";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { isAdmin, isAuth, formatDate } from "../utils.js";
import { getShippingPrice } from "../config/shippingZones.js";
import { getAuth } from "../auth.js";
import { placedOrder } from "../mailing/placedOrder.js";
import { placedOrderAdmin } from "../mailing/placedOrderAdmin.js";
import { orderPendingPayment } from "../mailing/orderPendingPayment.js";
import { sendMail } from "../mailing/sendMail.js";

const getAdminSession = async (req) => {
  try {
    const session = await getAuth().api.getSession({ headers: fromNodeHeaders(req.headers) });
    return session?.user?.role === "admin" ? session : null;
  } catch {
    return null;
  }
};

const orderRouter = express.Router();

let _stripe;
const getStripe = () => {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
};

const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many payment requests, please try again later." },
});

const validateToken = (order, token) =>
  token && order.confirmToken && token === order.confirmToken;

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
  createOrderLimiter,
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
        ...(product.isClothing && { size: item.size }),
      });
    }
    const itemsPrice = parseFloat(
      builtItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(2)
    );
    const shippingPrice = parseFloat(
      getShippingPrice(shippingAddress.country, shippingAddress.postalCode, itemsPrice).toFixed(2)
    );
    const totalPrice = parseFloat((itemsPrice + shippingPrice).toFixed(2));
    const itemsQty = builtItems.reduce((a, c) => a + c.qty, 0);
    const confirmToken = crypto.randomBytes(32).toString("hex");
    const order = new Order({
      orderItems: builtItems,
      shippingAddress,
      itemsQty,
      itemsPrice,
      shippingPrice,
      totalPrice,
      status: "IN PROGRESS",
      confirmToken,
    });
    const createdOrder = await order.save();

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const paymentUrl = `${frontendUrl}/cart/order/${createdOrder._id}?token=${confirmToken}`;
    const from = `${process.env.BRAND_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
    sendMail({
      from,
      to: shippingAddress.email,
      subject: `Order placed at ${process.env.BRAND_NAME}`,
      html: orderPendingPayment({ order: createdOrder, paymentUrl }),
    });
    sendMail({
      from,
      to: process.env.VITE_SENDER_EMAIL_ADDRESS,
      subject: `New order pending payment — ${shippingAddress.fullName}`,
      html: placedOrderAdmin({
        order: {
          orderId: createdOrder._id,
          orderDate: formatDate(createdOrder.createdAt.toISOString()),
          shippingAddress: createdOrder.shippingAddress,
          orderItems: createdOrder.orderItems,
          itemsPrice: createdOrder.itemsPrice,
          shippingPrice: createdOrder.shippingPrice,
          totalPrice: createdOrder.totalPrice,
        },
      }),
    });

    res.status(201).send({ message: "New order created", order: { ...createdOrder.toObject(), confirmToken } });
  })
);

orderRouter.get(
  "/:id",
  expressAsyncHandler(async (req, res) => {
    const isAdminUser = !!(await getAdminSession(req));
    const token = req.query.token;

    const orderWithToken = await Order.findById(req.params.id);
    if (!orderWithToken) return res.status(404).json({ message: "Order not found" });

    if (!isAdminUser && !validateToken(orderWithToken, token)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { confirmToken: _, ...orderData } = orderWithToken.toObject();
    res.json(orderData);
  })
);

orderRouter.post(
  "/:id/create-payment-intent",
  paymentLimiter,
  expressAsyncHandler(async (req, res) => {
    const { confirmToken } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: "Order not found" });
    if (!validateToken(order, confirmToken)) {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(order.totalPrice * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      receipt_email: order.shippingAddress.email,
      metadata: { orderId: order._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  })
);

orderRouter.put(
  "/:id/pay",
  paymentLimiter,
  expressAsyncHandler(async (req, res) => {
    const { paymentIntentId, confirmToken } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: "Order not found" });
    if (!validateToken(order, confirmToken)) {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: "Order already paid" });
    }
    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return res.status(400).json({ message: "paymentIntentId is required" });
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(402).json({ message: `Payment not succeeded: ${paymentIntent.status}` });
    }
    if (Math.abs(paymentIntent.amount_received - Math.round(order.totalPrice * 100)) > 1) {
      return res.status(402).json({ message: "Payment amount does not match order total" });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = "PAID";
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date(paymentIntent.created * 1000).toISOString(),
      email_address: paymentIntent.receipt_email || "",
    };

    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (!product.isClothing) {
          product.countInStock.stock -= item.qty;
        } else {
          if (item.size === "XS") product.countInStock.xs -= item.qty;
          else if (item.size === "S") product.countInStock.s -= item.qty;
          else if (item.size === "M") product.countInStock.m -= item.qty;
          else if (item.size === "L") product.countInStock.l -= item.qty;
          else if (item.size === "XL") product.countInStock.xl -= item.qty;
          else if (item.size === "XXL") product.countInStock.xxl -= item.qty;
        }
        await product.save();
      }
    }

    const updatedOrder = await order.save();

    const from = `${process.env.BRAND_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
    sendMail({
      from,
      to: order.shippingAddress.email,
      subject: `You placed a new order at ${process.env.BRAND_NAME}!`,
      html: placedOrder({
        order: {
          orderId: updatedOrder._id,
          orderDate: formatDate(updatedOrder.createdAt.toISOString()),
          shippingAddress: updatedOrder.shippingAddress,
          orderItems: updatedOrder.orderItems,
          itemsPrice: updatedOrder.itemsPrice,
          shippingPrice: updatedOrder.shippingPrice,
          totalPrice: updatedOrder.totalPrice,
        },
      }),
    });

    res.send({ message: "Order paid", order: updatedOrder });
  })
);

orderRouter.put(
  "/:id/cancel",
  expressAsyncHandler(async (req, res) => {
    const isAdminUser = !!(await getAdminSession(req));
    const { confirmToken } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: "Order not found" });

    if (!isAdminUser && !validateToken(order, confirmToken)) {
      return res.status(403).json({ message: "Access denied" });
    }

    order.status = "CANCELED";
    if (order.isPaid) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          if (!product.isClothing) {
            product.countInStock.stock += item.qty;
          } else {
            if (item.size === "XS") product.countInStock.xs += item.qty;
            else if (item.size === "S") product.countInStock.s += item.qty;
            else if (item.size === "M") product.countInStock.m += item.qty;
            else if (item.size === "L") product.countInStock.l += item.qty;
            else if (item.size === "XL") product.countInStock.xl += item.qty;
            else if (item.size === "XXL") product.countInStock.xxl += item.qty;
          }
          await product.save();
        }
      }
    }
    const updatedOrder = await order.save();
    res.send({ message: "Order canceled", order: updatedOrder });
  })
);

export default orderRouter;
