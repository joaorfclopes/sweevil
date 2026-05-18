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
const col = db.collection('bookings');

try {
  await col.dropIndex('date_1_slot_1');
  console.log('Dropped old non-unique index date_1_slot_1');
} catch (err) {
  if (err.code === 27) {
    console.log('Index date_1_slot_1 not found — already dropped or never created');
  } else {
    throw err;
  }
}

await col.createIndex(
  { date: 1, slot: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['PENDING_PAYMENT', 'CONFIRMED'] } } }
);
console.log('Created unique partial index on date + slot (excludes CANCELED)');

await mongoose.disconnect();
