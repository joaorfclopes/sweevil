import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

await mongoose.connect(MONGODB_URL);

const db = mongoose.connection.db;
const orders = db.collection('orders');

const result = await orders.updateMany({ shippingAddress: { $exists: true } }, [
  {
    $set: {
      shippingDetails: '$shippingAddress',
      billingDetails: {
        $ifNull: ['$billingAddress', '$shippingAddress'],
      },
    },
  },
  {
    $unset: ['shippingAddress', 'billingAddress'],
  },
]);

console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

await mongoose.disconnect();
