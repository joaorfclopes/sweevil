import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { clearAuthCollections, createAdminSession } from './helpers/adminSession.js';

let app;
let productId;
let Order;

const validShipping = {
  email: 'test@example.com',
  phoneNumber: '+351910000000',
  fullName: 'Test User',
  address: 'Rua Teste 1',
  city: 'Lisboa',
  postalCode: '1000-001',
  country: 'PT',
};

const validBilling = {
  fullName: 'Billing User',
  address: 'Rua Fatura 2',
  city: 'Porto',
  postalCode: '4000-001',
  country: 'PT',
};

beforeAll(async () => {
  const { createApp } = await import('../createApp.js');
  app = await createApp();
  const { default: OrderModel } = await import('../models/orderModel.js');
  Order = OrderModel;
  const { default: Product } = await import('../models/productModel.js');
  const product = await Product.create({
    name: 'Test Product',
    price: 10,
    images: ['img.jpg'],
    category: 'test',
    isClothing: false,
    countInStock: { stock: 10 },
    visible: true,
  });
  productId = product._id.toString();
});

afterAll(async () => {
  await clearAuthCollections();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await Order.deleteMany({});
});

describe('POST /api/orders', () => {
  it('creates order with shippingDetails and billingDetails', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ product: productId, qty: 1 }],
        shippingDetails: validShipping,
        billingDetails: validShipping,
      });
    expect(res.status).toBe(201);
    expect(res.body.order.shippingDetails).toMatchObject({ fullName: validShipping.fullName });
    expect(res.body.order.billingDetails).toMatchObject({ fullName: validShipping.fullName });
    expect(res.body.order.vatNif).toBeFalsy();
  });

  it('stores billingDetails and vatNif on created order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ product: productId, qty: 1 }],
        shippingDetails: validShipping,
        billingDetails: validBilling,
        vatNif: 'PT123456789',
      });
    expect(res.status).toBe(201);
    const { default: Order } = await import('../models/orderModel.js');
    const order = await Order.findOne({ confirmToken: res.body.order.confirmToken });
    expect(order.billingDetails).toMatchObject(validBilling);
    expect(order.vatNif).toBe('PT123456789');
  });

  it('rejects order without billingDetails', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ product: productId, qty: 1 }],
        shippingDetails: validShipping,
      });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/orders/:id/send', () => {
  let adminCookie;

  beforeAll(async () => {
    adminCookie = await createAdminSession();
  });

  it('stores carrier and trackingNumber on order', async () => {
    const { default: Order } = await import('../models/orderModel.js');
    const mongoose = await import('mongoose');
    const order = await Order.create({
      orderItems: [
        {
          name: 'T',
          qty: 1,
          image: 'i.jpg',
          price: 10,
          product: new mongoose.default.Types.ObjectId(),
        },
      ],
      shippingDetails: {
        email: 'a@a.com',
        phoneNumber: '+351910000000',
        fullName: 'A',
        address: 'St 1',
        city: 'Lisbon',
        postalCode: '1000-001',
        country: 'PT',
      },
      billingDetails: {
        fullName: 'A',
        address: 'St 1',
        city: 'Lisbon',
        postalCode: '1000-001',
        country: 'PT',
      },
      itemsQty: 1,
      itemsPrice: 10,
      shippingPrice: 0,
      totalPrice: 10,
      isPaid: true,
      status: 'PAID',
    });

    const res = await request(app)
      .put(`/api/orders/${order._id}/send`)
      .set('Cookie', adminCookie)
      .send({ carrier: 'DPD', trackingNumber: 'TRACK123' });

    expect(res.status).toBe(200);
    const updated = await Order.findById(order._id);
    expect(updated.carrier).toBe('DPD');
    expect(updated.trackingNumber).toBe('TRACK123');
    expect(updated.isSent).toBe(true);
    expect(updated.status).toBe('SENT');
  });

  it('marks as sent without trackingNumber when omitted', async () => {
    const { default: Order } = await import('../models/orderModel.js');
    const mongoose = await import('mongoose');
    const order = await Order.create({
      orderItems: [
        {
          name: 'T',
          qty: 1,
          image: 'i.jpg',
          price: 10,
          product: new mongoose.default.Types.ObjectId(),
        },
      ],
      shippingDetails: {
        email: 'a@a.com',
        phoneNumber: '+351910000000',
        fullName: 'A',
        address: 'St 1',
        city: 'Lisbon',
        postalCode: '1000-001',
        country: 'PT',
      },
      billingDetails: {
        fullName: 'A',
        address: 'St 1',
        city: 'Lisbon',
        postalCode: '1000-001',
        country: 'PT',
      },
      itemsQty: 1,
      itemsPrice: 10,
      shippingPrice: 0,
      totalPrice: 10,
      isPaid: true,
      status: 'PAID',
    });

    const res = await request(app)
      .put(`/api/orders/${order._id}/send`)
      .set('Cookie', adminCookie)
      .send({ carrier: 'CTT' });

    expect(res.status).toBe(200);
    const updated = await Order.findById(order._id);
    expect(updated.carrier).toBe('CTT');
    expect(updated.trackingNumber).toBeFalsy();
    expect(updated.isSent).toBe(true);
  });
});

describe('Order model invoiceNumber field', () => {
  it('defaults invoiceNumber to undefined on new orders', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ product: productId, qty: 1 }],
        shippingDetails: validShipping,
        billingDetails: validShipping,
      });
    expect(res.status).toBe(201);
    const order = await Order.findOne({ confirmToken: res.body.order.confirmToken });
    expect(order.invoiceNumber).toBeUndefined();
  });
});

describe('invoiceNumber persistence via findByIdAndUpdate', () => {
  it('can save and retrieve invoiceNumber on an order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ product: productId, qty: 1 }],
        shippingDetails: validShipping,
        billingDetails: validShipping,
      });
    expect(res.status).toBe(201);
    const order = await Order.findOne({ confirmToken: res.body.order.confirmToken });
    const updated = await Order.findByIdAndUpdate(
      order._id,
      { invoiceNumber: 'INV-0042' },
      { new: true }
    );
    expect(updated.invoiceNumber).toBe('INV-0042');
  });
});

describe('public order responses must not include _id', () => {
  it('POST /api/orders does not return _id', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ product: productId, qty: 1 }],
        shippingDetails: validShipping,
        billingDetails: validShipping,
      });
    expect(res.status).toBe(201);
    expect(res.body.order._id).toBeUndefined();
  });

  it('GET /api/orders/token/:token does not return _id', async () => {
    const order = await Order.create({
      orderItems: [{ product: productId, qty: 1, name: 'P', image: 'i.jpg', price: 10 }],
      shippingDetails: validShipping,
      billingDetails: validShipping,
      itemsQty: 1,
      itemsPrice: 10,
      shippingPrice: 5,
      totalPrice: 15,
      status: 'PENDING_PAYMENT',
      confirmToken: 'testtoken789',
      confirmTokenExpiresAt: new Date(Date.now() + 86400000),
    });
    const res = await request(app).get(`/api/orders/token/${order.confirmToken}`);
    expect(res.status).toBe(200);
    expect(res.body._id).toBeUndefined();
  });
});

describe('Token-based client routes', () => {
  it('POST /token/:token/create-payment-intent returns 404 for unknown token', async () => {
    const res = await request(app)
      .post('/api/orders/token/badtoken/create-payment-intent')
      .send({});
    expect(res.status).toBe(404);
  });

  it('PUT /token/:token/pay returns 404 for unknown token', async () => {
    const res = await request(app)
      .put('/api/orders/token/badtoken/pay')
      .send({ paymentIntentId: 'pi_test' });
    expect(res.status).toBe(404);
  });

  it('PUT /token/:token/cancel returns 404 for unknown token', async () => {
    const res = await request(app).put('/api/orders/token/badtoken/cancel').send({});
    expect(res.status).toBe(404);
  });

  it('PUT /token/:token/cancel cancels an unpaid order by token', async () => {
    const order = await Order.create({
      orderItems: [{ product: productId, qty: 1, name: 'P', image: 'i.jpg', price: 10 }],
      shippingDetails: validShipping,
      billingDetails: validShipping,
      itemsQty: 1,
      itemsPrice: 10,
      shippingPrice: 5,
      totalPrice: 15,
      status: 'PENDING_PAYMENT',
      confirmToken: 'validtoken456',
      confirmTokenExpiresAt: new Date(Date.now() + 86400000),
    });
    const res = await request(app).put(`/api/orders/token/${order.confirmToken}/cancel`).send({});
    expect(res.status).toBe(200);
    const updated = await Order.findOne({ confirmToken: 'validtoken456' });
    expect(updated.status).toBe('CANCELED');
  });

  it('POST /token/:token/create-payment-intent returns 403 for expired token', async () => {
    const order = await Order.create({
      orderItems: [{ product: productId, qty: 1, name: 'P', image: 'i.jpg', price: 10 }],
      shippingDetails: validShipping,
      billingDetails: validShipping,
      itemsQty: 1,
      itemsPrice: 10,
      shippingPrice: 5,
      totalPrice: 15,
      status: 'PENDING_PAYMENT',
      confirmToken: 'expiredtoken123',
      confirmTokenExpiresAt: new Date(Date.now() - 1000),
    });
    const res = await request(app)
      .post(`/api/orders/token/${order.confirmToken}/create-payment-intent`)
      .send({});
    expect(res.status).toBe(403);
  });
});
