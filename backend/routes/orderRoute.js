import * as Sentry from '@sentry/node';
import { fromNodeHeaders } from 'better-auth/node';
import crypto from 'crypto';
import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import rateLimit from 'express-rate-limit';
import Stripe from 'stripe';
import { getAuth } from '../auth.js';
import { getShippingPrice } from '../config/shippingZones.js';
import { cancelOrder as cancelOrderEmailPt } from '../mailing/cancelOrder.js';
import { cancelOrderAdmin as cancelOrderAdminEmail } from '../mailing/cancelOrderAdmin.js';
import { cancelOrder as cancelOrderEmailEn } from '../mailing/en/cancelOrder.js';
import { orderPendingPayment as orderPendingPaymentEn } from '../mailing/en/orderPendingPayment.js';
import { placedOrder as placedOrderEn } from '../mailing/en/placedOrder.js';
import { orderPendingPayment as orderPendingPaymentPt } from '../mailing/orderPendingPayment.js';
import { placedOrder as placedOrderPt } from '../mailing/placedOrder.js';
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

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management (admin only)
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: List all orders (paginated)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 100 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Filter by recipient full name
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, PAID, SENT, DELIVERED, CANCELLED] }
 *     responses:
 *       200:
 *         description: Paginated order list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items: { type: array }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 pages: { type: integer }
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not admin
 */
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
    if (search) query['shippingDetails.fullName'] = { $regex: search, $options: 'i' };
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);
    res.json({ items: orders, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  })
);

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order deleted
 *       404:
 *         description: Order not found
 */
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

/**
 * @swagger
 * /orders/{id}/send:
 *   put:
 *     summary: Mark an order as sent
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order marked as sent
 *       404:
 *         description: Order not found
 */
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
      if (req.body.carrier) order.carrier = req.body.carrier;
      if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
      const updatedOrder = await order.save();
      console.log(`[order] Order ${updatedOrder._id} marked as sent`);
      res.send({ message: 'Order sent', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);

/**
 * @swagger
 * /orders/{id}/deliver:
 *   put:
 *     summary: Mark an order as delivered
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order marked as delivered
 *       404:
 *         description: Order not found
 */
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
      order.confirmTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const updatedOrder = await order.save();
      console.log(`[order] Order ${updatedOrder._id} marked as delivered`);
      res.send({ message: 'Order delivered', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order not found' });
    }
  })
);

/**
 * @swagger
 * /orders/list:
 *   get:
 *     summary: List orders for the current authenticated user
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Array of orders belonging to the current user
 */
orderRouter.get(
  '/list',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderItems, shippingDetails]
 *             properties:
 *               orderItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product: { type: string }
 *                     qty: { type: integer }
 *                     size: { type: string }
 *               shippingDetails:
 *                 type: object
 *                 properties:
 *                   fullName: { type: string }
 *                   email: { type: string }
 *                   address: { type: string }
 *                   city: { type: string }
 *                   postalCode: { type: string }
 *                   country: { type: string }
 *                   phoneNumber: { type: string }
 *     responses:
 *       201:
 *         description: Order created, pending payment link emailed to customer
 *       400:
 *         description: Validation error or product not found
 *       429:
 *         description: Rate limit exceeded
 */
orderRouter.post(
  '/',
  createOrderLimiter,
  validate(createOrderSchema),
  expressAsyncHandler(async (req, res) => {
    const { orderItems, shippingDetails, billingDetails, vatNif } = req.body;
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
        slug: product.slug,
        ...(product.isClothing && { size: item.size }),
      });
    }
    const itemsPrice = parseFloat(builtItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(2));
    const shippingPrice = parseFloat(
      getShippingPrice(shippingDetails.country, shippingDetails.postalCode, itemsPrice).toFixed(2)
    );
    const totalPrice = parseFloat((itemsPrice + shippingPrice).toFixed(2));
    const itemsQty = builtItems.reduce((a, c) => a + c.qty, 0);
    const confirmToken = crypto.randomBytes(32).toString('hex');
    const order = new Order({
      orderItems: builtItems,
      shippingDetails,
      billingDetails,
      ...(vatNif && { vatNif }),
      itemsQty,
      itemsPrice,
      shippingPrice,
      totalPrice,
      status: 'IN_PROGRESS',
      confirmToken,
      lang: req.body.lang || 'en',
    });
    const createdOrder = await order.save();
    Sentry.metrics.count('order.created', 1);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const paymentUrl = `${frontendUrl}/cart/order/${confirmToken}`;
    const from = `${process.env.BRAND_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
    const isPtOrder = createdOrder.lang === 'pt';
    await sendMail({
      from,
      to: shippingDetails.email,
      subject: isPtOrder
        ? `Encomenda em ${process.env.BRAND_NAME}`
        : `Order at ${process.env.BRAND_NAME}`,
      html: (isPtOrder ? orderPendingPaymentPt : orderPendingPaymentEn)({
        order: createdOrder,
        paymentUrl,
      }),
    });
    await sendMail({
      from,
      to: process.env.VITE_SENDER_EMAIL_ADDRESS,
      subject: `New order pending payment — ${shippingDetails.fullName}`,
      html: placedOrderAdmin({
        order: {
          invoiceNumber: null,
          confirmToken: createdOrder.confirmToken,
          orderDate: formatDate(createdOrder.createdAt.toISOString()),
          shippingDetails: createdOrder.shippingDetails,
          orderItems: createdOrder.orderItems,
          itemsPrice: createdOrder.itemsPrice,
          shippingPrice: createdOrder.shippingPrice,
          totalPrice: createdOrder.totalPrice,
        },
      }),
    });

    console.log(
      `[order] Created order ${createdOrder._id} — ${itemsQty} item(s), €${totalPrice} for ${shippingDetails.email} (${shippingDetails.country})`
    );
    const { _id: _omit, ...createdOrderData } = createdOrder.toObject();
    res
      .status(201)
      .send({ message: 'New order created', order: { ...createdOrderData, confirmToken } });
  })
);

/**
 * @swagger
 * /orders/token/{token}:
 *   get:
 *     summary: Get an order by confirm token (public — used in customer payment flow)
 *     tags: [Orders]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *         description: The order confirm token sent to the customer via email
 *     responses:
 *       200:
 *         description: Order data (without confirmToken)
 *       403:
 *         description: Order access expired
 *       404:
 *         description: Order not found
 */
orderRouter.get(
  '/token/:token',
  expressAsyncHandler(async (req, res) => {
    const orderWithToken = await Order.findOne({ confirmToken: req.params.token });
    if (!orderWithToken) return res.status(404).json({ message: 'Order not found' });
    if (orderWithToken.confirmTokenExpiresAt && orderWithToken.confirmTokenExpiresAt < new Date()) {
      return res.status(403).json({ message: 'Order access expired' });
    }
    const {
      _id: _omitId,
      confirmToken: _,
      confirmTokenExpiresAt: __,
      ...orderData
    } = orderWithToken.toObject();
    res.json(orderData);
  })
);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order by ID (admin only)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Order data
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
orderRouter.get(
  '/:id',
  expressAsyncHandler(async (req, res) => {
    const isAdminUser = !!(await getAdminSession(req));

    const orderWithToken = await Order.findById(req.params.id);
    if (!orderWithToken) return res.status(404).json({ message: 'Order not found' });

    if (!isAdminUser) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { confirmToken: _, ...orderData } = orderWithToken.toObject();
    res.json(orderData);
  })
);

/**
 * @swagger
 * /orders/{id}/create-payment-intent:
 *   post:
 *     summary: Create a Stripe PaymentIntent for the order
 *     tags: [Orders]
 *     security: []
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
 *             required: [confirmToken]
 *             properties:
 *               confirmToken: { type: string }
 *     responses:
 *       200:
 *         description: Stripe client secret
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clientSecret: { type: string }
 *       400:
 *         description: Order already paid
 *       403:
 *         description: Invalid token
 *       404:
 *         description: Order not found
 *       429:
 *         description: Rate limit exceeded
 */
orderRouter.post(
  '/token/:token/create-payment-intent',
  paymentLimiter,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findOne({ confirmToken: req.params.token });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.confirmTokenExpiresAt && order.confirmTokenExpiresAt < new Date()) {
      return res.status(403).json({ message: 'Order access expired' });
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
    const tax = getTax(order.shippingDetails.country, order.itemsPrice);
    const taxCents = tax ? Math.round(tax.amount * 100) : 0;
    const netItemsCents = totalCents - taxCents - shippingCents;

    const customer = await stripe.customers.create({
      email: order.shippingDetails.email,
      name: order.shippingDetails.fullName,
      phone: order.shippingDetails.phoneNumber,
      metadata: { orderId: order._id.toString() },
    });

    if (order.vatNif && order.vatNif.replace(/\s/g, '').length >= 8) {
      const EU_VAT_COUNTRIES = new Set([
        'AT',
        'BE',
        'BG',
        'CY',
        'CZ',
        'DE',
        'DK',
        'EE',
        'GR',
        'ES',
        'FI',
        'FR',
        'HR',
        'HU',
        'IE',
        'IT',
        'LT',
        'LU',
        'LV',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SE',
        'SI',
        'SK',
      ]);
      const country = order.billingDetails?.country || order.shippingDetails?.country;
      let taxIdType;
      if (country === 'GB') taxIdType = 'gb_vat';
      else if (country === 'CH') taxIdType = 'ch_vat';
      else if (country === 'NO') taxIdType = 'no_vat';
      else if (country === 'IS') taxIdType = 'is_vat';
      else if (EU_VAT_COUNTRIES.has(country)) taxIdType = 'eu_vat';
      if (taxIdType) {
        try {
          const nif = order.vatNif;
          const value =
            taxIdType === 'eu_vat' && !nif.toUpperCase().startsWith(country)
              ? `${country}${nif}`
              : nif;
          await stripe.customers.createTaxId(customer.id, { type: taxIdType, value });
        } catch (taxErr) {
          console.error('Stripe tax ID creation failed:', taxErr.message);
        }
      }
    }

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

/**
 * @swagger
 * /orders/{id}/pay:
 *   put:
 *     summary: Confirm payment and mark order as paid
 *     tags: [Orders]
 *     security: []
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
 *             required: [paymentIntentId, confirmToken]
 *             properties:
 *               paymentIntentId: { type: string }
 *               confirmToken: { type: string }
 *     responses:
 *       200:
 *         description: Order paid and confirmation emails sent
 *       400:
 *         description: Invalid or missing paymentIntentId
 *       402:
 *         description: Payment not succeeded or amount mismatch
 *       403:
 *         description: Invalid token
 *       404:
 *         description: Order not found
 *       429:
 *         description: Rate limit exceeded
 */
orderRouter.put(
  '/token/:token/pay',
  paymentLimiter,
  expressAsyncHandler(async (req, res) => {
    const { paymentIntentId } = req.body;
    const order = await Order.findOne({ confirmToken: req.params.token });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.confirmTokenExpiresAt && order.confirmTokenExpiresAt < new Date()) {
      return res.status(403).json({ message: 'Order access expired' });
    }
    if (order.isPaid) {
      return res.status(400).json({ message: 'Order already paid' });
    }
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return res.status(400).json({ message: 'paymentIntentId is required' });
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });
    const pm = paymentIntent.payment_method;
    const pmType = pm?.type || paymentIntent.payment_method_types?.[0] || '';
    const pmLast =
      pmType === 'mb_way' ? pm?.billing_details?.phone?.slice(-3) || '' : pm?.card?.last4 || '';
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
      paymentMethod: pmType,
      paymentMethodLast: pmLast,
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
          if (paidInvoice.number) {
            invoiceNumber = paidInvoice.number;
            await Order.findByIdAndUpdate(order._id, { invoiceNumber: paidInvoice.number });
          }
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
      const isPtPay = updatedOrder.lang === 'pt';
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
        invoiceNumber: invoiceNumber,
        confirmToken: updatedOrder.confirmToken,
        orderDate: formatDate(updatedOrder.createdAt.toISOString()),
        shippingDetails: updatedOrder.shippingDetails,
        orderItems: updatedOrder.orderItems,
        itemsPrice: updatedOrder.itemsPrice,
        shippingPrice: updatedOrder.shippingPrice,
        totalPrice: updatedOrder.totalPrice,
      };
      await sendMail({
        from,
        to: order.shippingDetails.email,
        subject: isPtPay
          ? `Fez uma nova encomenda em ${process.env.BRAND_NAME}!`
          : `Thank You for Your Order at ${process.env.BRAND_NAME}!`,
        html: (isPtPay ? placedOrderPt : placedOrderEn)({
          order: orderEmailData,
          hasInvoice: !!invoicePdfBuffer,
        }),
        attachments: invoiceAttachment,
      });
      await sendMail({
        from,
        to: process.env.VITE_SENDER_EMAIL_ADDRESS,
        subject: `Order paid — ${updatedOrder.shippingDetails.fullName}`,
        html: placedOrderAdmin({ order: orderEmailData }),
        attachments: invoiceAttachment,
      });
      await Order.findByIdAndUpdate(updatedOrder._id, { confirmationEmailSent: true });
    }
    Sentry.metrics.count('order.completed', 1);
    Sentry.metrics.gauge('order.amount', updatedOrder.totalPrice);
    console.log(
      `[order] Order ${updatedOrder._id} paid — €${updatedOrder.totalPrice} for ${updatedOrder.shippingDetails.email}`
    );

    const {
      _id: _oid,
      confirmToken: _ct,
      confirmTokenExpiresAt: _cte,
      ...paidOrderData
    } = updatedOrder.toObject();
    res.send({ message: 'Order paid', order: paidOrderData });
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

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId, {
      expand: ['payment_method'],
    });
    const pm = paymentIntent.payment_method;
    const pmType = pm?.type || paymentIntent.payment_method_types?.[0] || '';
    const pmLast =
      pmType === 'mb_way' ? pm?.billing_details?.phone?.slice(-3) || '' : pm?.card?.last4 || '';
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
      paymentMethod: pmType,
      paymentMethodLast: pmLast,
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
          if (paidInvoice.number) {
            invoiceNumber = paidInvoice.number;
            await Order.findByIdAndUpdate(order._id, { invoiceNumber: paidInvoice.number });
          }
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
      const isPtPay = updatedOrder.lang === 'pt';
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
        invoiceNumber: invoiceNumber,
        confirmToken: updatedOrder.confirmToken,
        orderDate: formatDate(updatedOrder.createdAt.toISOString()),
        shippingDetails: updatedOrder.shippingDetails,
        orderItems: updatedOrder.orderItems,
        itemsPrice: updatedOrder.itemsPrice,
        shippingPrice: updatedOrder.shippingPrice,
        totalPrice: updatedOrder.totalPrice,
      };
      await sendMail({
        from,
        to: order.shippingDetails.email,
        subject: isPtPay
          ? `Fez uma nova encomenda em ${process.env.BRAND_NAME}!`
          : `Thank You for Your Order at ${process.env.BRAND_NAME}!`,
        html: (isPtPay ? placedOrderPt : placedOrderEn)({
          order: orderEmailData,
          hasInvoice: !!invoicePdfBuffer,
        }),
        attachments: invoiceAttachment,
      });
      await sendMail({
        from,
        to: process.env.VITE_SENDER_EMAIL_ADDRESS,
        subject: `Order paid — ${updatedOrder.shippingDetails.fullName}`,
        html: placedOrderAdmin({ order: orderEmailData }),
        attachments: invoiceAttachment,
      });
      await Order.findByIdAndUpdate(updatedOrder._id, { confirmationEmailSent: true });
    }
    Sentry.metrics.count('order.completed', 1);
    Sentry.metrics.gauge('order.amount', updatedOrder.totalPrice);
    console.log(
      `[order] Order ${updatedOrder._id} paid — €${updatedOrder.totalPrice} for ${updatedOrder.shippingDetails.email}`
    );

    res.send({ message: 'Order paid', order: updatedOrder });
  })
);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order (customer via token or admin)
 *     tags: [Orders]
 *     security: []
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
 *               confirmToken: { type: string, description: Required if not admin }
 *               refundChoice:
 *                 type: string
 *                 enum: [yes, no]
 *                 description: Admin only — whether to issue a Stripe refund
 *     responses:
 *       200:
 *         description: Order canceled
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
orderRouter.put(
  '/token/:token/cancel',
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findOne({ confirmToken: req.params.token });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.confirmTokenExpiresAt && order.confirmTokenExpiresAt < new Date()) {
      return res.status(403).json({ message: 'Order access expired' });
    }

    if (order.isPaid) {
      for (const item of order.orderItems) {
        const field = item.isClothing
          ? `countInStock.${item.size.toLowerCase()}`
          : 'countInStock.stock';
        await Product.findByIdAndUpdate(item.product, { $inc: { [field]: item.qty } });
      }
      order.status = 'CANCELED_PENDING_REFUND';
    } else {
      order.status = 'CANCELED';
    }
    const updatedOrder = await order.save();
    console.log(
      `[order] Order ${updatedOrder._id} cancelled — isPaid: ${updatedOrder.isPaid}, by: customer (token)`
    );

    const isPtCancel = updatedOrder.lang === 'pt';
    sendMail({
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: updatedOrder.shippingDetails.email,
      subject: isPtCancel ? 'Encomenda Cancelada!' : 'Order Cancelled!',
      html: (isPtCancel ? cancelOrderEmailPt : cancelOrderEmailEn)({
        order: {
          invoiceNumber: updatedOrder.invoiceNumber ?? '-',
          confirmToken: updatedOrder.confirmToken,
          orderDate: formatDate(updatedOrder.createdAt.toISOString()),
          isPaid: updatedOrder.isPaid,
          cancelledByAdmin: false,
          refundIssued: updatedOrder.isRefunded,
          shippingDetails: {
            fullName: updatedOrder.shippingDetails.fullName,
            country: updatedOrder.shippingDetails.country,
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
          invoiceNumber: updatedOrder.invoiceNumber ?? '-',
          confirmToken: updatedOrder.confirmToken,
          orderDate: formatDate(updatedOrder.createdAt.toISOString()),
          isPaid: updatedOrder.isPaid,
          cancelledByAdmin: false,
          refundIssued: updatedOrder.isRefunded,
          shippingDetails: {
            fullName: updatedOrder.shippingDetails.fullName,
            email: updatedOrder.shippingDetails.email,
            phoneNumber: updatedOrder.shippingDetails.phoneNumber,
          },
          orderItems: updatedOrder.orderItems,
          itemsPrice: updatedOrder.itemsPrice,
          shippingPrice: updatedOrder.shippingPrice,
          totalPrice: updatedOrder.totalPrice,
        },
      }),
    });

    const {
      _id: _cid,
      confirmToken: _ct,
      confirmTokenExpiresAt: _cte,
      ...cancelOrderData
    } = updatedOrder.toObject();
    res.send({ message: 'Order canceled', order: cancelOrderData });
  })
);

orderRouter.put(
  '/:id/cancel',
  expressAsyncHandler(async (req, res) => {
    const isAdminUser = !!(await getAdminSession(req));
    const { confirmToken, refundChoice } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order not found' });

    if (!isAdminUser && !validateToken(order, confirmToken)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.isPaid) {
      for (const item of order.orderItems) {
        const field = item.isClothing
          ? `countInStock.${item.size.toLowerCase()}`
          : 'countInStock.stock';
        await Product.findByIdAndUpdate(item.product, { $inc: { [field]: item.qty } });
      }
      if (isAdminUser) {
        if (refundChoice === 'yes' && !order.isRefunded) {
          try {
            await getStripe().refunds.create({ payment_intent: order.paymentResult.id });
            order.isRefunded = true;
            order.status = 'CANCELED_REFUNDED';
          } catch (refundErr) {
            console.error(`[order] Stripe refund failed for ${order._id}:`, refundErr.message);
            order.status = 'CANCELED_PENDING_REFUND';
          }
        } else if (refundChoice === 'no') {
          order.status = 'CANCELED_NO_REFUND';
        } else {
          order.status = 'CANCELED';
        }
      } else {
        order.status = 'CANCELED_PENDING_REFUND';
      }
    } else {
      order.status = 'CANCELED';
    }
    const updatedOrder = await order.save();
    console.log(
      `[order] Order ${updatedOrder._id} cancelled — isPaid: ${updatedOrder.isPaid}, by: ${isAdminUser ? 'admin' : 'customer'}`
    );

    const isPtCancel = updatedOrder.lang === 'pt';
    sendMail({
      from: `${process.env.SENDER_USER_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`,
      to: updatedOrder.shippingDetails.email,
      subject: isPtCancel ? 'Encomenda Cancelada!' : 'Order Cancelled!',
      html: (isPtCancel ? cancelOrderEmailPt : cancelOrderEmailEn)({
        order: {
          invoiceNumber: updatedOrder.invoiceNumber ?? '-',
          confirmToken: updatedOrder.confirmToken,
          orderDate: formatDate(updatedOrder.createdAt.toISOString()),
          isPaid: updatedOrder.isPaid,
          cancelledByAdmin: isAdminUser,
          refundIssued: updatedOrder.isRefunded,
          shippingDetails: {
            fullName: updatedOrder.shippingDetails.fullName,
            country: updatedOrder.shippingDetails.country,
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
      subject:
        isAdminUser && updatedOrder.isPaid && updatedOrder.isRefunded
          ? 'Order Cancelled — Refund Issued'
          : isAdminUser && updatedOrder.isPaid && refundChoice === 'no'
            ? 'Order Cancelled — No Refund'
            : updatedOrder.isPaid
              ? 'Refund Request'
              : 'Order Canceled',
      html: cancelOrderAdminEmail({
        order: {
          invoiceNumber: updatedOrder.invoiceNumber ?? '-',
          confirmToken: updatedOrder.confirmToken,
          orderDate: formatDate(updatedOrder.createdAt.toISOString()),
          isPaid: updatedOrder.isPaid,
          cancelledByAdmin: isAdminUser,
          refundIssued: updatedOrder.isRefunded,
          shippingDetails: {
            fullName: updatedOrder.shippingDetails.fullName,
            email: updatedOrder.shippingDetails.email,
            phoneNumber: updatedOrder.shippingDetails.phoneNumber,
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

/**
 * @swagger
 * /orders/{id}/dismiss-refund:
 *   put:
 *     summary: Dismiss a pending refund request (set status to CANCELED_NO_REFUND)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Refund dismissed
 *       400:
 *         description: Order is not in pending refund state
 *       404:
 *         description: Order not found
 */
orderRouter.put(
  '/:id/dismiss-refund',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order not found' });
    if (order.status !== 'CANCELED_PENDING_REFUND') {
      return res.status(400).send({ message: 'Order is not in pending refund state' });
    }
    order.status = 'CANCELED_NO_REFUND';
    const updatedOrder = await order.save();
    console.log(`[order] Refund dismissed for ${order._id} — status set to CANCELED_NO_REFUND`);
    res.send({ message: 'Refund dismissed', order: updatedOrder });
  })
);

/**
 * @swagger
 * /orders/{id}/refund:
 *   post:
 *     summary: Issue a manual Stripe refund for a paid order
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Refund issued and order marked as CANCELED_REFUNDED
 *       400:
 *         description: Order is not paid or already refunded
 *       404:
 *         description: Order not found
 */
orderRouter.post(
  '/:id/refund',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).send({ message: 'Order not found' });
    if (order.status !== 'CANCELED_PENDING_REFUND')
      return res.status(400).send({ message: 'Order is not pending refund' });
    if (!order.isPaid) return res.status(400).send({ message: 'Order is not paid' });
    if (order.isRefunded) return res.status(400).send({ message: 'Order already refunded' });

    await getStripe().refunds.create({ payment_intent: order.paymentResult.id });
    order.isRefunded = true;
    order.status = 'CANCELED_REFUNDED';
    const updatedOrder = await order.save();
    console.log(`[order] Manual refund issued for ${order._id} — €${order.totalPrice}`);
    res.send({ message: 'Refund issued', order: updatedOrder });
  })
);

export default orderRouter;
