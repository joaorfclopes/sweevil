import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
if (!MONGODB_URL) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

const productSchema = new mongoose.Schema(
  {
    name: String,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

await mongoose.connect(MONGODB_URL);
console.log('Connected to MongoDB');

const products = await Product.find({}).sort({ createdAt: 1 });
console.log(`Found ${products.length} products`);

for (let i = 0; i < products.length; i++) {
  await Product.updateOne({ _id: products[i]._id }, { $set: { sortOrder: i } });
  console.log(`  [${i}] ${products[i].name}`);
}

console.log(`Done. Seeded sortOrder for ${products.length} products.`);
await mongoose.disconnect();
