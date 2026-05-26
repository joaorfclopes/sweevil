import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import { clearAuthCollections, createAdminSession } from './helpers/adminSession.js';

let app;
let adminCookie;

beforeAll(async () => {
  const { createApp } = await import('../createApp.js');
  app = await createApp();
});

afterAll(async () => {
  await mongoose.disconnect();
});

beforeEach(async () => {
  await clearAuthCollections();
  adminCookie = await createAdminSession();
  const { default: Product } = await import('../models/productModel.js');
  await Product.deleteMany({});
});

describe('Products', () => {
  it('GET /api/products returns array (public)', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/products creates a product (admin)', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Cookie', adminCookie)
      .send({
        name: 'Test Product',
        price: 25,
        category: 'test-category',
        isClothing: false,
        countInStock: { stock: 10 },
        visible: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.product).toHaveProperty('_id');
    expect(res.body.product.name).toBe('Test Product');
  });

  it('POST /api/products returns 401 without auth', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Fail', price: 10 });
    expect(res.status).toBe(401);
  });

  it('created product appears in admin list', async () => {
    await request(app)
      .post('/api/products')
      .set('Cookie', adminCookie)
      .send({
        name: 'Listed Product',
        price: 10,
        category: 'test-category',
        isClothing: false,
        countInStock: { stock: 1 },
        visible: true,
      });

    const res = await request(app).get('/api/products?all=true').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
    expect(res.body.items.some((p) => p.name === 'Listed Product')).toBe(true);
  });

  it('DELETE /api/products/:id removes the product (admin)', async () => {
    const create = await request(app)
      .post('/api/products')
      .set('Cookie', adminCookie)
      .send({
        name: 'To Delete',
        price: 5,
        category: 'test-category',
        isClothing: false,
        countInStock: { stock: 1 },
        visible: false,
      });
    const id = create.body.product._id;

    const del = await request(app).delete(`/api/products/${id}`).set('Cookie', adminCookie);
    expect(del.status).toBe(200);

    const { default: Product } = await import('../models/productModel.js');
    const found = await Product.findById(id);
    expect(found).toBeNull();
  });
});
