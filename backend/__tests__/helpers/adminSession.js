import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

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

  return `better-auth.session_token=${sessionToken}`;
}

export async function clearAuthCollections() {
  const db = mongoose.connection.getClient().db();
  await db.collection('user').deleteMany({});
  await db.collection('session').deleteMany({});
}
