import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Stripe from 'stripe';

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

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

const orderSchema = new mongoose.Schema(
  {
    isPaid: { type: Boolean },
    stripeInvoiceId: { type: String },
    invoiceNumber: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

await mongoose.connect(MONGODB_URL);
console.log('Connected to MongoDB');

const orders = await Order.find({
  isPaid: true,
  stripeInvoiceId: { $exists: true, $ne: null },
  invoiceNumber: { $exists: false },
});

console.log(`Found ${orders.length} paid orders missing invoiceNumber`);

let updated = 0;
let skipped = 0;
let errors = 0;

for (const order of orders) {
  try {
    const invoice = await stripe.invoices.retrieve(order.stripeInvoiceId);
    if (invoice.number) {
      order.invoiceNumber = invoice.number;
      await order.save();
      console.log(`  ${order._id}: invoiceNumber = ${invoice.number}`);
      updated++;
    } else {
      console.log(`  ${order._id}: Stripe invoice has no number yet, skipping`);
      skipped++;
    }
  } catch (e) {
    console.error(`  ${order._id}: ERROR — ${e.message}`);
    errors++;
  }
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
await mongoose.disconnect();
