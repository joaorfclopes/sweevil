import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

/**
 * Sign a raw token the same way better-call's setSignedCookie does:
 *   cookieValue = encodeURIComponent(rawToken + "." + base64(HMAC-SHA256(rawToken, secret)))
 */
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

export async function createAdminSession() {
  const db = mongoose.connection.getClient().db();
  const userId = new ObjectId();
  const sessionToken = `test-admin-token-${userId.toString()}`;

  await db.collection('user').insertOne({
    _id: userId,
    name: 'Test Admin',
    email: 'admin@test.com',
    emailVerified: true,
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.collection('session').insertOne({
    _id: new ObjectId(),
    token: sessionToken,
    userId: userId.toString(),
    expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const signedToken = await signSessionToken(sessionToken);
  return `better-auth.session_token=${signedToken}`;
}

export async function clearAuthCollections() {
  const db = mongoose.connection.getClient().db();
  await db.collection('user').deleteMany({});
  await db.collection('session').deleteMany({});
}
