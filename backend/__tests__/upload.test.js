import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import { dirname, join } from 'path';
import request from 'supertest';
import { fileURLToPath } from 'url';
import { clearAuthCollections, createAdminSession } from './helpers/adminSession.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEST_IMAGE = readFileSync(join(__dirname, '../../frontend/public/background.png'));

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
});

describe('Upload', () => {
  it('POST /api/uploads/s3 returns S3 location (MOCK_S3=true, admin)', async () => {
    const res = await request(app)
      .post('/api/uploads/s3?folder=gallery')
      .set('Cookie', adminCookie)
      .attach('image', TEST_IMAGE, { filename: 'test.png', contentType: 'image/png' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('location');
    expect(res.body.location).toMatch(/^https:\/\//);
  });

  it('POST /api/uploads/s3 returns 401 without auth', async () => {
    const res = await request(app)
      .post('/api/uploads/s3?folder=gallery')
      .attach('image', TEST_IMAGE, { filename: 'test.png', contentType: 'image/png' });
    expect(res.status).toBe(401);
  });
});
