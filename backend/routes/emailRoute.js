import express from "express";
import expressAsyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { isAuth, formatDate, isAdmin } from "../utils.js";
import { placedOrder } from "../mailing/placedOrder.js";
import { placedOrderAdmin } from "../mailing/placedOrderAdmin.js";
import { sendOrder } from "../mailing/sendOrder.js";
import { deliveredOrder } from "../mailing/deliveredOrder.js";
import { resetPassword } from "../mailing/resetPassword.js";
import { cancelOrder } from "../mailing/cancelOrder.js";
import { cancelOrderAdmin } from "../mailing/cancelOrderAdmin.js";

const emailRouter = express.Router();

const sendEmail = (res, mailOptions) => {
  const transporter = nodemailer.createTransport({
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

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send({ yo: "error" });
      console.log(error);
    } else {
      res.send({ yo: info.response });
    }
  });
};

emailRouter.post(
  "/placedOrder",
  expressAsyncHandler((req, res) => {
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: req.body.order.shippingAddress.email,
      subject: `You placed a new order at ${process.env.BRAND_NAME}!`,
      html: placedOrder({
        order: {
          orderId: req.body.order._id,
          orderDate: formatDate(req.body.order.createdAt),
          shippingAddress: {
            fullName: req.body.order.shippingAddress.fullName,
            address: req.body.order.shippingAddress.address,
            country: req.body.order.shippingAddress.country,
            postalCode: req.body.order.shippingAddress.postalCode,
            city: req.body.order.shippingAddress.city,
          },
          orderItems: req.body.order.orderItems,
          itemsPrice: req.body.order.itemsPrice,
          shippingPrice: req.body.order.shippingPrice,
          totalPrice: req.body.order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/placedOrderAdmin",
  expressAsyncHandler((req, res) => {
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: process.env.REACT_APP_SENDER_EMAIL_ADDRESS,
      subject: "A new order was placed!",
      html: placedOrderAdmin({
        order: {
          orderId: req.body.order._id,
          orderDate: formatDate(req.body.order.createdAt),
          shippingAddress: {
            email: req.body.order.shippingAddress.email,
            phoneNumber: req.body.order.shippingAddress.phoneNumber,
            fullName: req.body.order.shippingAddress.fullName,
            address: req.body.order.shippingAddress.address,
            country: req.body.order.shippingAddress.country,
            postalCode: req.body.order.shippingAddress.postalCode,
            city: req.body.order.shippingAddress.city,
          },
          orderItems: req.body.order.orderItems,
          itemsPrice: req.body.order.itemsPrice,
          shippingPrice: req.body.order.shippingPrice,
          totalPrice: req.body.order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/sentOrder",
  expressAsyncHandler((req, res) => {
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: req.body.order.shippingAddress.email,
      subject: "Your order's on its way!",
      html: sendOrder({
        order: {
          orderId: req.body.order._id,
          orderDate: formatDate(req.body.order.createdAt),
          shippingAddress: {
            fullName: req.body.order.shippingAddress.fullName,
            address: req.body.order.shippingAddress.address,
            country: req.body.order.shippingAddress.country,
            postalCode: req.body.order.shippingAddress.postalCode,
            city: req.body.order.shippingAddress.city,
          },
          orderItems: req.body.order.orderItems,
          itemsPrice: req.body.order.itemsPrice,
          shippingPrice: req.body.order.shippingPrice,
          totalPrice: req.body.order.totalPrice,
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
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: req.body.order.shippingAddress.email,
      subject: "Thanks for your order!",
      html: deliveredOrder({
        order: {
          orderId: req.body.order._id,
          orderDate: formatDate(req.body.order.createdAt),
          shippingAddress: {
            fullName: req.body.order.shippingAddress.fullName,
            address: req.body.order.shippingAddress.address,
            country: req.body.order.shippingAddress.country,
            postalCode: req.body.order.shippingAddress.postalCode,
            city: req.body.order.shippingAddress.city,
          },
          orderItems: req.body.order.orderItems,
          itemsPrice: req.body.order.itemsPrice,
          shippingPrice: req.body.order.shippingPrice,
          totalPrice: req.body.order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/cancelOrder",
  expressAsyncHandler(async (req, res) => {
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: req.body.order.shippingAddress.email,
      subject: "Order Canceled!",
      html: cancelOrder({
        order: {
          orderId: req.body.order._id,
          orderDate: formatDate(req.body.order.createdAt),
          shippingAddress: {
            fullName: req.body.order.shippingAddress.fullName,
          },
          orderItems: req.body.order.orderItems,
          itemsPrice: req.body.order.itemsPrice,
          shippingPrice: req.body.order.shippingPrice,
          totalPrice: req.body.order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/cancelOrderAdmin",
  expressAsyncHandler((req, res) => {
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
      to: process.env.REACT_APP_SENDER_EMAIL_ADDRESS,
      subject: "Refund Request",
      html: cancelOrderAdmin({
        order: {
          orderId: req.body.order._id,
          orderDate: formatDate(req.body.order.createdAt),
          shippingAddress: {
            fullName: req.body.order.shippingAddress.fullName,
            email: req.body.order.shippingAddress.email,
            phoneNumber: req.body.order.shippingAddress.phoneNumber,
          },
          orderItems: req.body.order.orderItems,
          itemsPrice: req.body.order.itemsPrice,
          shippingPrice: req.body.order.shippingPrice,
          totalPrice: req.body.order.totalPrice,
        },
      }),
    };
    sendEmail(res, mailOptions);
  })
);

emailRouter.post(
  "/forgotPassword",
  expressAsyncHandler(async (req, res) => {
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      try {
        const mailOptions = {
          from: `${process.env.SENDER_USER_NAME} <${process.env.REACT_APP_SENDER_EMAIL_ADDRESS}>`,
          to: user.email,
          subject: `Your ${process.env.BRAND_NAME} password reset link is ready`,
          html: resetPassword({
            userInfo: {
              userId: user._id,
              email: bcrypt.hashSync(user.email, 8),
            },
          }),
        };
        sendEmail(res, mailOptions);
      } catch (error) {
        res.status(404).send({ message: "User doesn't exist" });
      }
    } else {
      res.status(404).send({ message: "Error sending reset password link" });
    }
  })
);

export default emailRouter;
