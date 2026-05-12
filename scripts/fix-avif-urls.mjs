/**
 * One-time patch: update DB image URLs to .avif after S3 migration deleted old files.
 * Migration converted S3 objects but updateDbUrl matched 0 docs → DB still has old extensions.
 *
 * Usage:
 *   node scripts/fix-avif-urls.mjs           # live run
 *   node scripts/fix-avif-urls.mjs --dry-run # preview only
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

dotenv.config();

const DRY_RUN = process.argv.includes("--dry-run");

const gallerySchema = new mongoose.Schema({ image: String }, { strict: false });
const productSchema = new mongoose.Schema({ images: [String] }, { strict: false });
const bookingSchema = new mongoose.Schema({ images: [String] }, { strict: false });

const GalleryImage = mongoose.model("Gallery", gallerySchema);
const Product = mongoose.model("Product", productSchema);
const Booking = mongoose.model("Booking", bookingSchema);

function toAvifUrl(url) {
  const ext = path.extname(new URL(url).pathname);
  if (!ext || ext === ".avif") return null;
  return url.slice(0, url.length - ext.length) + ".avif";
}

async function fixSingleField(Model, name) {
  const docs = await Model.find({ image: { $exists: true, $not: /\.avif$/ } });
  let count = 0;
  for (const doc of docs) {
    const fixed = toAvifUrl(doc.image);
    if (!fixed) continue;
    console.log(`  ${name}: ${doc.image}\n       → ${fixed}`);
    if (!DRY_RUN) await Model.findByIdAndUpdate(doc._id, { image: fixed });
    count++;
  }
  return count;
}

async function fixArrayField(Model, name) {
  const docs = await Model.find({ images: { $elemMatch: { $not: /\.avif$/ } } });
  let count = 0;
  for (const doc of docs) {
    const fixedImages = doc.images.map((url) => {
      try {
        const fixed = toAvifUrl(url);
        return fixed || url;
      } catch {
        return url;
      }
    });
    const changed = fixedImages.some((u, i) => u !== doc.images[i]);
    if (!changed) continue;
    doc.images.forEach((orig, i) => {
      if (orig !== fixedImages[i]) console.log(`  ${name}: ${orig}\n         → ${fixedImages[i]}`);
    });
    if (!DRY_RUN) await Model.findByIdAndUpdate(doc._id, { images: fixedImages });
    count++;
  }
  return count;
}

await mongoose.connect(process.env.MONGODB_URL);
console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}\n`);

const g = await fixSingleField(GalleryImage, "GalleryImage");
const p = await fixArrayField(Product, "Product");
const b = await fixArrayField(Booking, "Booking");

console.log(`\nUpdated: ${g} gallery, ${p} products, ${b} bookings.`);
await mongoose.disconnect();
