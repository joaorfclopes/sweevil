import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Stripe from 'stripe';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY not set');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

await mongoose.connect(MONGODB_URL);

const db = mongoose.connection.db;
const orders = db.collection('orders');

const toMigrate = await orders
  .find({ isPaid: true, 'paymentResult.paymentMethod': { $in: [null, '', undefined] } })
  .toArray();

console.log(`Found ${toMigrate.length} paid orders without paymentMethod`);

let updated = 0;
let fromStripe = 0;
let fallback = 0;

for (const order of toMigrate) {
  const piId = order.paymentResult?.id;
  let paymentMethod = 'card';

  if (piId && piId.startsWith('pi_') && !piId.startsWith('pi_seed_')) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId);
      paymentMethod = pi.payment_method_types?.[0] || 'card';
      fromStripe++;
    } catch (err) {
      console.warn(`  Could not fetch PI ${piId}: ${err.message} — defaulting to card`);
      fallback++;
    }
  } else {
    fallback++;
  }

  await orders.updateOne(
    { _id: order._id },
    { $set: { 'paymentResult.paymentMethod': paymentMethod } }
  );
  updated++;
}

console.log(`Updated: ${updated} (${fromStripe} from Stripe, ${fallback} defaulted to card)`);

await mongoose.disconnect();
