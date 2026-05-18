import * as Sentry from '@sentry/node';
import { fromNodeHeaders } from 'better-auth/node';
import crypto from 'crypto';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
import { getAuth } from '../auth.js';
import { getShippingPrice } from '../config/shippingZones.js';
import { cancelOrder as cancelOrderEmail } from '../mailing/cancelOrder.js';
import { cancelOrderAdmin as cancelOrderAdminEmail } from '../mailing/cancelOrderAdmin.js';
import { orderPendingPayment } from '../mailing/orderPendingPayment.js';
import { placedOrder } from '../mailing/placedOrder.js';
import { placedOrderAdmin } from '../mailing/placedOrderAdmin.js';
import { sendMail } from '../mailing/sendMail.js';
import { getTax } from '../mailing/taxRates.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { formatDate, isAdmin, isAuth } from '../utils.js';
import { createOrderSchema, validate } from '../validation.js';

const getAdminSession = async (req) => {
  try {
    const session = await getAuth().api.getSession({ headers: fromNodeHeaders(req.headers) });
    return session?.user?.role === 'admin' ? session : null;
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
  message: { message: 'Too many requests, please try again later.' },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many payment requests, please try again later.' },
});

const validateToken = (order, token) => token && order.confirmToken && token === order.confirmToken;

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const pageNum = Math.max(1, parseInt(req.query.page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const { search = '', status = '' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query['shippingAddress.fullName'] = { $regex: search, $options: 'i' };
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    res.json({ items: orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.send({ message: 'Order deleted', order });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);

orderRouter.put(
  '/:id/send',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isSent = true;
      order.sentAt = Date.now();
      order.status = 'SENT';
      const updatedOrder = await order.save();
      console.log(`[order] Order ${updatedOrder._id} marked as sent`);
      res.send({ message: 'Order sent', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);

orderRouter.put(
  '/:id/deliver',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.status = 'DELIVERED';
      const updatedOrder = await order.save();
      console.log(`[order] Order ${updatedOrder._id} marked as delivered`);
      res.send({ message: 'Order delivered', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);

orderRouter.get(
  '/list',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

orderRouter.post(
  '/',
  createOrderLimiter,
  validate(createOrderSchema),
  expressAsyncHandler(async (req, res) => {
    const { orderItems, shippingAddress } = req.body;
    const builtItems = [];
    for (const item of orderItems) {
      const qty = item.qty;
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).send({ message: 'Product not found' });
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
    const itemsPrice = parseFloat(builtItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(2));
    const shippingPrice = parseFloat(
      getShippingPrice(shippingAddress.country, shippingAddress.postalCode, itemsPrice).toFixed(2)
    );
    const totalPrice = parseFloat((itemsPrice + shippingPrice).toFixed(2));
    const itemsQty = builtItems.reduce((a, c) => a + c.qty, 0);
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const order = new Order({
      orderItems: builtItems,
      shippingAddress,
      itemsQty,
      itemsPrice,
      shippingPrice,
      totalPrice,
      status: 'IN PROGRESS',
      confirmToken,
    });
    const createdOrder = await order.save();
    Sentry.metrics.count('order.created', 1);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentUrl = `${frontendUrl}/cart/order/${createdOrder._id}?token=${confirmToken}`;
    const from = `${process.env.BRAND_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
    await sendMail({
      from,
      to: shippingAddress.email,
      subject: `Order placed at ${process.env.BRAND_NAME}`,
      html: orderPendingPayment({ order: createdOrder, paymentUrl }),
    });
    await sendMail({
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

    console.log(
      `[order] Created order ${createdOrder._id} — ${itemsQty} item(s), €${totalPrice} for ${shippingAddress.email} (${shippingAddress.country})`
    );
    res
      .status(201)
      .send({ message: 'New order created', order: { ...createdOrder.toObject(), confirmToken } });
  })
);

orderRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const isAdminUser = !!(await getAdminSession(req));
    const token = req.query.token;

    const orderWithToken = await Order.findById(req.params.id);
    if (!orderWithToken) return res.status(404).json({ message: 'Order not found' });

    if (!isAdminUser && !validateToken(orderWithToken, token)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { confirmToken: _, ...orderData } = orderWithToken.toObject();
    res.json(orderData);
  })
);

orderRouter.post(
  '/:id/create-payment-intent',
  paymentLimiter,
  expressAsyncHandler(async (req, res) => {
    const { confirmToken } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order not found' });
    if (!validateToken(order, confirmToken)) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order already paid' });
    }
    const stripe = getStripe();

    // Reuse existing PaymentIntent on page refresh
    if (order.stripeInvoiceId && order.paymentResult?.id) {
      const pi = await stripe.paymentIntents.retrieve(order.paymentResult.id);
      if (pi.status === 'requires_payment_method' || pi.status === 'requires_confirmation') {
        return res.json({ clientSecret: pi.client_secret });
      }
    }

    const totalCents = Math.round(order.totalPrice * 100);
    const shippingCents = Math.round(order.shippingPrice * 100);
    const tax = getTax(order.shippingAddress.country, order.itemsPrice);
    const taxCents = tax ? Math.round(tax.amount * 100) : 0;
    const netItemsCents = totalCents - taxCents - shippingCents;

    const customer = await stripe.customers.create({
      email: order.shippingAddress.email,
      name: order.shippingAddress.fullName,
      phone: order.shippingAddress.phoneNumber,
      metadata: { orderId: order._id.toString() },
    });

    const invoice = await stripe.invoices.create(
      {
        customer: customer.id,
        currency: 'eur',
        collection_method: 'send_invoice',
        days_until_due: 30,
        auto_advance: false,
        metadata: { orderId: order._id.toString() },
      },
      { idempotencyKey: `inv-${order._id}` }
    );

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: netItemsCents,
      currency: 'eur',
      description: `Products (${order.itemsQty} item${order.itemsQty !== 1 ? 's' : ''})`,
    });

    if (taxCents > 0) {
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        amount: taxCents,
        currency: 'eur',
        description: `${tax.label} (${tax.display})`,
      });
    }

    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: shippingCents,
      currency: 'eur',
      description: 'Shipping',
    });

    await stripe.invoices.finalizeInvoice(invoice.id);

    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: totalCents,
        currency: 'eur',
        automatic_payment_methods: { enabled: true, allow_redirects: 'never' },
        statement_descriptor_suffix: 'Order',
        metadata: { orderId: order._id.toString(), stripeInvoiceId: invoice.id },
      },
      { idempotencyKey: `pi-${order._id}` }
    );

    order.stripeInvoiceId = invoice.id;
    order.paymentResult = { id: paymentIntent.id };
    await order.save();

    res.json({ clientSecret: paymentIntent.client_secret });
  })
);

orderRouter.put(
  '/:id/pay',
  paymentLimiter,
  expressAsyncHandler(async (req, res) => {
    const { paymentIntentId, confirmToken } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order not found' });
    if (!validateToken(order, confirmToken)) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order already paid' });
    }
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ message: 'paymentIntentId is required' });
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      return res.status(402).json({ message: `Payment not succeeded: ${paymentIntent.status}` });
    }
    if (Math.abs(paymentIntent.amount_received - Math.round(order.totalPrice * 100)) > 1) {
      return res.status(402).json({ message: 'Payment amount does not match order total' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'PAID';
    order.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date(paymentIntent.created * 1000).toISOString(),
      email_address: paymentIntent.receipt_email || '',
      invoiceId: order.stripeInvoiceId || null,
    };

    for (const item of order.orderItems) {
      const field = item.isClothing
        ? `countInStock.${item.size.toLowerCase()}`
        : 'countInStock.stock';
      await Product.findByIdAndUpdate(item.product, { $inc: { [field]: -item.qty } });
    }

    const updatedOrder = await order.save();

    if (!updatedOrder.confirmationEmailSent) {
      let invoicePdfBuffer = null;
      let invoiceNumber = 'invoice';
      if (order.stripeInvoiceId) {
        try {
          await getStripe().invoices.pay(order.stripeInvoiceId, { paid_out_of_band: true });
          const paidInvoice = await getStripe().invoices.retrieve(order.stripeInvoiceId);
          if (paidInvoice.number) invoiceNumber = paidInvoice.number;
          if (paidInvoice.invoice_pdf) {
            const pdfUrl = new URL(paidInvoice.invoice_pdf);
            if (pdfUrl.protocol !== 'https:' || !pdfUrl.hostname.endsWith('.stripe.com')) {
              throw new Error('Unexpected invoice_pdf origin');
            }
            const pdfRes = await fetch(pdfUrl.toString());
            invoicePdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
          }
        } catch (e) {
          console.error('[order] Failed to process invoice:', e.message);
        }
      }
      const from = `${process.env.BRAND_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
      const invoiceAttachment = invoicePdfBuffer
        ? [
            {
              filename: `${invoiceNumber}.pdf`,
              content: invoicePdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [];
      const orderEmailData = {
        orderId: updatedOrder._id,
        orderDate: formatDate(updatedOrder.createdAt.toISOString()),
        shippingAddress: updatedOrder.shippingAddress,
        orderItems: updatedOrder.orderItems,
        itemsPrice: updatedOrder.itemsPrice,
        shippingPrice: updatedOrder.shippingPrice,
        totalPrice: updatedOrder.totalPrice,
      };
      await sendMail({
        from,
        to: order.shippingAddress.email,
        subject: `You placed a new order at ${process.env.BRAND_NAME}!`,
        html: placedOrder({ order: orderEmailData, hasInvoice: !!invoicePdfBuffer }),
        attachments: invoiceAttachment,
      });
      await sendMail({
        from,
        to: process.env.VITE_SENDER_EMAIL_ADDRESS,
        subject: `Order paid — ${updatedOrder.shippingAddress.fullName}`,
        html: placedOrderAdmin({ order: orderEmailData }),
        attachments: invoiceAttachment,
      });
      await Order.findByIdAndUpdate(updatedOrder._id, { confirmationEmailSent: true });
    }
    Sentry.metrics.count('order.completed', 1);
    Sentry.metrics.gauge('order.amount', updatedOrder.totalPrice);
    console.log(
      `[order] Order ${updatedOrder._id} paid — €${updatedOrder.totalPrice} for ${updatedOrder.shippingAddress.email}`
    );

    res.send({ message: 'Order paid', order: updatedOrder });
  })
);

orderRouter.put(
  '/:id/cancel',
  expressAsyncHandler(async (req, res) => {
    const isAdminUser = !!(await getAdminSession(req));
    const { confirmToken } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order not found' });

    if (!isAdminUser && !validateToken(order, confirmToken)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    order.status = 'CANCELED';
    if (order.isPaid) {
      for (const item of order.orderItems) {
        const field = item.isClothing
          ? `countInStock.${item.size.toLowerCase()}`
          : 'countInStock.stock';
        await Product.findByIdAndUpdate(item.product, { $inc: { [field]: item.qty } });
      }
    }
    const updatedOrder = await order.save();
    console.log(
      `[order] Order ${updatedOrder._id} cancelled — isPaid: ${updatedOrder.isPaid}, by: ${isAdminUser ? 'admin' : 'customer'}`
    );

    sendMail({
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: updatedOrder.shippingAddress.email,
      subject: 'Order Canceled!',
      html: cancelOrderEmail({
        order: {
          orderId: updatedOrder._id,
          orderDate: formatDate(updatedOrder.createdAt.toISOString()),
          isPaid: updatedOrder.isPaid,
          shippingAddress: {
            fullName: updatedOrder.shippingAddress.fullName,
            country: updatedOrder.shippingAddress.country,
          },
          orderItems: updatedOrder.orderItems,
          itemsPrice: updatedOrder.itemsPrice,
          shippingPrice: updatedOrder.shippingPrice,
          totalPrice: updatedOrder.totalPrice,
        },
      }),
    });

    sendMail({
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: process.env.VITE_SENDER_EMAIL_ADDRESS,
      subject: updatedOrder.isPaid ? 'Refund Request' : 'Order Canceled',
      html: cancelOrderAdminEmail({
        order: {
          orderId: updatedOrder._id,
          orderDate: formatDate(updatedOrder.createdAt.toISOString()),
          isPaid: updatedOrder.isPaid,
          shippingAddress: {
            fullName: updatedOrder.shippingAddress.fullName,
            email: updatedOrder.shippingAddress.email,
            phoneNumber: updatedOrder.shippingAddress.phoneNumber,
          },
          orderItems: updatedOrder.orderItems,
          itemsPrice: updatedOrder.itemsPrice,
          shippingPrice: updatedOrder.shippingPrice,
          totalPrice: updatedOrder.totalPrice,
        },
      }),
    });

    res.send({ message: 'Order canceled', order: updatedOrder });
  })
);

export default orderRouter;
