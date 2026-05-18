import 'dotenv/config';
import { mkdir, writeFile } from 'fs/promises';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import About from '../backend/models/aboutModel.js';
import Category from '../backend/models/categoryModel.js';
import GalleryImage from '../backend/models/galleryImageModel.js';
import ProductCategory from '../backend/models/productCategoryModel.js';
import Product from '../backend/models/productModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');

await mkdir(DATA_DIR, { recursive: true });

const url = process.env.MONGODB_URL;
if (!url) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

console.log('Connecting to prod DB…');
await mongoose.connect(url);

const [categories, productCategories, products, abouts, galleryImages] = await Promise.all([
  Category.find().lean(),
  ProductCategory.find().lean(),
  Product.find().lean(),
  About.find().lean(),
  GalleryImage.find().lean(),
]);

await Promise.all([
  writeFile(path.join(DATA_DIR, 'categories.json'), JSON.stringify(categories, null, 2)),
  writeFile(
    path.join(DATA_DIR, 'productCategories.json'),
    JSON.stringify(productCategories, null, 2)
  ),
  writeFile(path.join(DATA_DIR, 'products.json'), JSON.stringify(products, null, 2)),
  writeFile(path.join(DATA_DIR, 'about.json'), JSON.stringify(abouts, null, 2)),
  writeFile(path.join(DATA_DIR, 'galleryImages.json'), JSON.stringify(galleryImages, null, 2)),
]);

console.log(`Exported:`);
console.log(`  categories:        ${categories.length}`);
console.log(`  productCategories: ${productCategories.length}`);
console.log(`  products:          ${products.length}`);
console.log(`  about docs:        ${abouts.length}`);
console.log(`  gallery images:    ${galleryImages.length}`);
console.log(`Files written to scripts/data/`);

await mongoose.disconnect();
