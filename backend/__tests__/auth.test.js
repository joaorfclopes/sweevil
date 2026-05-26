import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import request from 'supertest';
import { clearAuthCollections, createAdminSession } from './helpers/adminSession.js';

async function signSessionToken(rawToken) {
  const secret = process.env.BETTER_AUTH_SECRET;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawToken));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
  return encodeURIComponent(`${rawToken}.${b64}`);
}

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

describe('Auth protection', () => {
  it('returns 401 on admin route without session cookie', async () => {
    const res = await request(app).get('/api/orders');
    expect(res.status).toBe(401);
  });

  it('returns 403 on admin route with non-admin session', async () => {
    const db = mongoose.connection.getClient().db();
    const userId = new ObjectId();
    await db.collection('user').insertOne({
      _id: userId,
      name: 'Regular User',
      email: 'user@test.com',
      emailVerified: true,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const userToken = `test-user-token-${userId.toString()}`;
    await db.collection('session').insertOne({
      _id: new ObjectId(),
      token: userToken,
      userId: userId.toString(),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const signedUserToken = await signSessionToken(userToken);
    const res = await request(app)
      .get('/api/orders')
      .set('Cookie', `better-auth.session_token=${signedUserToken}`);
    expect(res.status).toBe(403);
  });

  it('returns 200 on admin route with valid admin session', async () => {
    const res = await request(app).get('/api/orders').set('Cookie', adminCookie);
    expect(res.status).toBe(200);
  });
});
