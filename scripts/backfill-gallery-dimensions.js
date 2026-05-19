import 'dotenv/config';
import mongoose from 'mongoose';
import sharp from 'sharp';
import GalleryImage from '../backend/models/galleryImageModel.js';

const url = process.env.MONGODB_URL;
if (!url) {
  console.error('MONGODB_URL not set');
  process.exit(1);
}

await mongoose.connect(url);
console.log('Connected to MongoDB');

const images = await GalleryImage.find({
  $or: [{ width: { $exists: false } }, { height: { $exists: false } }],
});
console.log(`Found ${images.length} images without dimensions\n`);

let updated = 0;
let failed = 0;

for (const img of images) {
  try {
    const response = await fetch(img.image);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const { width, height } = await sharp(buffer).metadata();
    await GalleryImage.findByIdAndUpdate(img._id, { width, height });
    console.log(`✓ ${img._id}: ${width}×${height}`);
    updated++;
  } catch (err) {
    console.error(`✗ ${img._id} (${img.image}): ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. Updated: ${updated}, Failed: ${failed}`);
await mongoose.disconnect();
