import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

const orderSchema = new mongoose.Schema(
  {
    confirmToken: { type: String },
    confirmTokenExpiresAt: { type: Date },
    status: { type: String },
    isDelivered: { type: Boolean },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

await mongoose.connect(MONGODB_URL);
console.log('Connected to MongoDB');

const orders = await Order.find({ confirmToken: { $exists: false } });
console.log(`Found ${orders.length} orders missing confirmToken`);

let updated = 0;
for (const order of orders) {
  order.confirmToken = crypto.randomBytes(32).toString('hex');
  const isTerminal = order.isDelivered || order.status?.startsWith('CANCELED');
  order.confirmTokenExpiresAt = isTerminal
    ? new Date(Date.now() - 1)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await order.save();
  console.log(`  ${order._id}: token set (expires ${order.confirmTokenExpiresAt.toISOString()})`);
  updated++;
}

console.log(`Done. Updated ${updated} orders.`);
await mongoose.disconnect();
