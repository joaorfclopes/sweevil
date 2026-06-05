import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';

let app;
let productId;

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
  await mongoose.disconnect();
});

beforeEach(async () => {
  const { default: Order } = await import('../models/orderModel.js');
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
    const order = await Order.findById(res.body.order._id);
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
