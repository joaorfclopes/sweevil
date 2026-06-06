import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { cancelOrder as cancelOrderPt } from '../mailing/cancelOrder.js';
import { cancelOrderAdmin } from '../mailing/cancelOrderAdmin.js';
import { deliveredOrder as deliveredOrderPt } from '../mailing/deliveredOrder.js';
import { cancelOrder as cancelOrderEn } from '../mailing/en/cancelOrder.js';
import { deliveredOrder as deliveredOrderEn } from '../mailing/en/deliveredOrder.js';
import { placedOrder as placedOrderEn } from '../mailing/en/placedOrder.js';
import { sendOrder as sendOrderEn } from '../mailing/en/sendOrder.js';
import { placedOrder as placedOrderPt } from '../mailing/placedOrder.js';
import { placedOrderAdmin } from '../mailing/placedOrderAdmin.js';
import { sendOrder as sendOrderPt } from '../mailing/sendOrder.js';
import { buildTrackingUrl } from '../mailing/trackingUrl.js';
import Order from '../models/orderModel.js';
import { formatDate, isAdmin, isAuth } from '../utils.js';

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Trigger transactional order notification emails
 */

const emailRouter = express.Router();

let _etherealAccount = null;

const getTransporter = async () => {
  if (process.env.MAILING_SERVICE_CLIENT_ID) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.VITE_SENDER_EMAIL_ADDRESS,
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
    console.log('[email] View sent emails at: https://ethereal.email/messages');
  }

  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: { user: _etherealAccount.user, pass: _etherealAccount.pass },
  });
};

const sendEmail = async (res, mailOptions) => {
  const transporter = await getTransporter();
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.send({ yo: 'error' });
      console.log(error);
    } else {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log(`[email] Preview: ${previewUrl}`);
      res.send({ yo: info.response });
    }
  });
};

/**
 * @swagger
 * /emails/placedOrder:
 *   post:
 *     summary: Send order confirmation email to the customer
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *     responses:
 *       200:
 *         description: Email sent
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
emailRouter.post(
  '/placedOrder',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const isPt = order.lang === 'pt';
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingDetails.email,
      subject: isPt
        ? `Fez uma nova encomenda em ${process.env.BRAND_NAME}!`
        : `Thank You for Your Order at ${process.env.BRAND_NAME}!`,
      html: (isPt ? placedOrderPt : placedOrderEn)({
        order: {
          orderId: order._id,
          confirmToken: order.confirmToken,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingDetails: {
            fullName: order.shippingDetails.fullName,
            address: order.shippingDetails.address,
            country: order.shippingDetails.country,
            postalCode: order.shippingDetails.postalCode,
            city: order.shippingDetails.city,
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

/**
 * @swagger
 * /emails/placedOrderAdmin:
 *   post:
 *     summary: Send new-order notification email to the admin
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *     responses:
 *       200:
 *         description: Email sent
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
emailRouter.post(
  '/placedOrderAdmin',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user?.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: process.env.VITE_SENDER_EMAIL_ADDRESS,
      subject: 'A new order was placed!',
      html: placedOrderAdmin({
        order: {
          orderId: order._id,
          confirmToken: order.confirmToken,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingDetails: {
            email: order.shippingDetails.email,
            phoneNumber: order.shippingDetails.phoneNumber,
            fullName: order.shippingDetails.fullName,
            address: order.shippingDetails.address,
            country: order.shippingDetails.country,
            postalCode: order.shippingDetails.postalCode,
            city: order.shippingDetails.city,
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

/**
 * @swagger
 * /emails/sentOrder:
 *   post:
 *     summary: Send shipping dispatch email to the customer (admin only)
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *     responses:
 *       200:
 *         description: Email sent
 *       404:
 *         description: Order not found
 */
emailRouter.post(
  '/sentOrder',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const isPtSent = order.lang === 'pt';
    const trackingUrl = buildTrackingUrl(
      order.carrier,
      order.trackingNumber,
      order.shippingDetails.postalCode
    );
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingDetails.email,
      subject: isPtSent ? 'A sua encomenda está a caminho!' : 'Your Order Is on Its Way!',
      html: (isPtSent ? sendOrderPt : sendOrderEn)({
        order: {
          invoiceNumber: order.invoiceNumber ?? '-',
          confirmToken: order.confirmToken,
          orderDate: formatDate(order.createdAt.toISOString()),
          trackingUrl,
          carrier: order.carrier,
          trackingNumber: order.trackingNumber,
          shippingDetails: {
            fullName: order.shippingDetails.fullName,
            address: order.shippingDetails.address,
            country: order.shippingDetails.country,
            postalCode: order.shippingDetails.postalCode,
            city: order.shippingDetails.city,
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

/**
 * @swagger
 * /emails/deliveredOrder:
 *   post:
 *     summary: Send delivery confirmation email to the customer (admin only)
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *     responses:
 *       200:
 *         description: Email sent
 *       404:
 *         description: Order not found
 */
emailRouter.post(
  '/deliveredOrder',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const isPtDelivered = order.lang === 'pt';
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingDetails.email,
      subject: isPtDelivered ? 'Obrigado pela sua encomenda!' : 'Your Order Has Been Delivered!',
      html: (isPtDelivered ? deliveredOrderPt : deliveredOrderEn)({
        order: {
          invoiceNumber: order.invoiceNumber ?? '-',
          confirmToken: order.confirmToken,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingDetails: {
            fullName: order.shippingDetails.fullName,
            address: order.shippingDetails.address,
            country: order.shippingDetails.country,
            postalCode: order.shippingDetails.postalCode,
            city: order.shippingDetails.city,
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

/**
 * @swagger
 * /emails/cancelOrder:
 *   post:
 *     summary: Send order cancellation email to the customer
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *     responses:
 *       200:
 *         description: Email sent
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
emailRouter.post(
  '/cancelOrder',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user?.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const isPtCancel = order.lang === 'pt';
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: order.shippingDetails.email,
      subject: isPtCancel ? 'Encomenda Cancelada!' : 'Order Cancelled!',
      html: (isPtCancel ? cancelOrderPt : cancelOrderEn)({
        order: {
          orderId: order._id,
          confirmToken: order.confirmToken,
          orderDate: formatDate(order.createdAt.toISOString()),
          isPaid: order.isPaid,
          shippingDetails: {
            fullName: order.shippingDetails.fullName,
            country: order.shippingDetails.country,
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

/**
 * @swagger
 * /emails/cancelOrderAdmin:
 *   post:
 *     summary: Send refund request / cancellation notification to the admin
 *     tags: [Email]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order]
 *             properties:
 *               order:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *     responses:
 *       200:
 *         description: Email sent
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
emailRouter.post(
  '/cancelOrderAdmin',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.body.order?._id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user?.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const mailOptions = {
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: process.env.VITE_SENDER_EMAIL_ADDRESS,
      subject: 'Refund Request',
      html: cancelOrderAdmin({
        order: {
          orderId: order._id,
          confirmToken: order.confirmToken,
          orderDate: formatDate(order.createdAt.toISOString()),
          shippingDetails: {
            fullName: order.shippingDetails.fullName,
            email: order.shippingDetails.email,
            phoneNumber: order.shippingDetails.phoneNumber,
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
