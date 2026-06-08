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

const toMigrate = await orders.find({ isPaid: true }).toArray();

console.log(`Found ${toMigrate.length} paid orders without paymentMethod`);

let updated = 0;
let fromStripe = 0;
let fallback = 0;

for (const order of toMigrate) {
  const piId = order.paymentResult?.id;
  let paymentMethod = 'card';

  let last4 = null;

  if (piId && piId.startsWith('pi_') && !piId.startsWith('pi_seed_')) {
    try {
      const pi = await stripe.paymentIntents.retrieve(piId, {
        expand: ['latest_charge', 'payment_method'],
      });
      const details = pi.latest_charge?.payment_method_details;
      paymentMethod = details?.type || pi.payment_method_types?.[0] || 'card';
      if (paymentMethod === 'card') {
        last4 = details?.card?.last4 ?? null;
      } else if (paymentMethod === 'mb_way') {
        const phone =
          pi.payment_method?.mb_way?.phone ??
          order.billingDetails?.phoneNumber ??
          order.shippingDetails?.phoneNumber ??
          null;
        last4 = phone ? phone.replace(/\D/g, '').slice(-3) : null;
      }
      fromStripe++;
    } catch (err) {
      console.warn(`  Could not fetch PI ${piId}: ${err.message} — defaulting to card`);
      fallback++;
    }
  } else {
    fallback++;
  }

  const update = { 'paymentResult.paymentMethod': paymentMethod };
  if (last4) update['paymentResult.paymentMethodLast'] = last4;

  await orders.updateOne({ _id: order._id }, { $set: update });
  updated++;
}

console.log(`Updated: ${updated} (${fromStripe} from Stripe, ${fallback} defaulted to card)`);

await mongoose.disconnect();
