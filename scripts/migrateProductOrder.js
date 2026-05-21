import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const productSchema = new mongoose.Schema({}, { timestamps: true, strict: false });
const Product = mongoose.model('Product', productSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected. Fetching products...');

  // Newest first → gets sortOrder 0 (displayed first in shop)
  const products = await Product.find({}).sort({ createdAt: -1 });
  console.log(`Found ${products.length} products`);

  for (let i = 0; i < products.length; i++) {
    await Product.updateOne({ _id: products[i]._id }, { $set: { sortOrder: i } });
  }

  console.log('Migration complete');
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
