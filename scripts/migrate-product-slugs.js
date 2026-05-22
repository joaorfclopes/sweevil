import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 12);

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

const productSchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true, sparse: true },
});

const Product = mongoose.model('Product', productSchema);

await mongoose.connect(MONGODB_URL);
console.log('Connected to MongoDB');

const products = await Product.find({
  $or: [{ slug: { $exists: false } }, { slug: /[^0-9A-Za-z]/ }],
});
console.log(`Found ${products.length} products needing new slug`);

let updated = 0;
for (const product of products) {
  const oldSlug = product.slug ?? '(none)';
  product.slug = nanoid(12);
  await product.save();
  console.log(`  ${product.name}: ${oldSlug} → ${product.slug}`);
  updated++;
}

console.log(`Done. Updated ${updated} products.`);
await mongoose.disconnect();
