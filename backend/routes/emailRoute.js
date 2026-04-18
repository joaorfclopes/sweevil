import express from "express";
import expressAsyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import { isAuth, formatDate, isAdmin } from "../utils.js";
import { placedOrder } from "../mailing/placedOrder.js";
import { placedOrderAdmin } from "../mailing/placedOrderAdmin.js";
import { sendOrder } from "../mailing/sendOrder.js";
import { deliveredOrder } from "../mailing/deliveredOrder.js";
import { cancelOrder } from "../mailing/cancelOrder.js";
import { cancelOrderAdmin } from "../mailing/cancelOrderAdmin.js";
import Order from "../models/orderModel.js";

const emailRouter = express.Router();

let _etherealAccount = null;

const getTransporter = async () => {
  if (process.env.MAILING_SERVICE_CLIENT_ID) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.REACT_APP_SENDER_EMAIL_ADDRESS,
        clientId: process.env.MAILING_SERVICE_CLIENT_ID,
        clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
        refreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
        accessToken: process.env.MAILING_SERVICE_ACCESS_TOKEN,
      },
    });
  }

  if (!_etherealAccount) {
    _etherealAccount = await nodemailer.createTestAccount();
    console.log(
      `[email] Ethereal test account: ${_etherealAccount.user} / ${_etherealAccount.pass}`
    );
    console.log("[email] View sent emails at: https://ethereal.email/messages");
  }

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: _etherealAccount.user, pass: _etherealAccount.pass },
  });
};

const sendEmail = async (res, mailOptions) => {
  const transporter = await getTransporter();
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send({ yo: "error" });
      console.log(error);
    } else {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`[email] Preview: ${previewUrl}`);
      res.send({ yo: info.response });
    }
  });
};

emailRouter.post(
  "/placedOrder",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingAddress.email,
      subject: `You placed a new order at ${process.env.BRAND_NAME}!`,
      html: placedOrder({
        order: {
          orderId: order._id,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingAddress: {
            fullName: order.shippingAddress.fullName,
            address: order.shippingAddress.address,
            country: order.shippingAddress.country,
            postalCode: order.shippingAddress.postalCode,
            city: order.shippingAddress.city,
          },
          orderItems: order.orderItems,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/placedOrderAdmin",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user?.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: process.env.REACT_APP_SENDER_EMAIL_ADDRESS,
      subject: "A new order was placed!",
      html: placedOrderAdmin({
        order: {
          orderId: order._id,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingAddress: {
            email: order.shippingAddress.email,
            phoneNumber: order.shippingAddress.phoneNumber,
            fullName: order.shippingAddress.fullName,
            address: order.shippingAddress.address,
            country: order.shippingAddress.country,
            postalCode: order.shippingAddress.postalCode,
            city: order.shippingAddress.city,
          },
          orderItems: order.orderItems,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/sentOrder",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingAddress.email,
      subject: "Your order's on its way!",
      html: sendOrder({
        order: {
          orderId: order._id,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingAddress: {
            fullName: order.shippingAddress.fullName,
            address: order.shippingAddress.address,
            country: order.shippingAddress.country,
            postalCode: order.shippingAddress.postalCode,
            city: order.shippingAddress.city,
          },
          orderItems: order.orderItems,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/deliveredOrder",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingAddress.email,
      subject: "Thanks for your order!",
      html: deliveredOrder({
        order: {
          orderId: order._id,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingAddress: {
            fullName: order.shippingAddress.fullName,
            address: order.shippingAddress.address,
            country: order.shippingAddress.country,
            postalCode: order.shippingAddress.postalCode,
            city: order.shippingAddress.city,
          },
          orderItems: order.orderItems,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/cancelOrder",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user?.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingAddress.email,
      subject: "Order Canceled!",
      html: cancelOrder({
        order: {
          orderId: order._id,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingAddress: {
            fullName: order.shippingAddress.fullName,
          },
          orderItems: order.orderItems,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/cancelOrderAdmin",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user?.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: process.env.REACT_APP_SENDER_EMAIL_ADDRESS,
      subject: "Refund Request",
      html: cancelOrderAdmin({
        order: {
          orderId: order._id,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingAddress: {
            fullName: order.shippingAddress.fullName,
            email: order.shippingAddress.email,
            phoneNumber: order.shippingAddress.phoneNumber,
          },
          orderItems: order.orderItems,
          itemsPrice: order.itemsPrice,
          shippingPrice: order.shippingPrice,
          totalPrice: order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

export default emailRouter;
