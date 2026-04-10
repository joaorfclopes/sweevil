/**
 * One-time patch: replace us-east-1 with eu-west-3 in gallery image URLs.
 * Run once, then delete this file.
 *
 * Usage: node scripts/fix-gallery-urls.mjs
 */

import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const gallerySchema = new mongoose.Schema({ image: String }, { strict: false });
const GalleryImage = mongoose.model("Gallery", gallerySchema);

await mongoose.connect(process.env.MONGODB_URL);
console.log("Connected to MongoDB\n");

const docs = await GalleryImage.find({ image: /s3\.us-east-1\.amazonaws\.com/ });
console.log(`Found ${docs.length} doc(s) with wrong region in URL.`);

for (const doc of docs) {
  const fixed = doc.image.replace("s3.us-east-1.amazonaws.com", "s3.eu-west-3.amazonaws.com");
  await GalleryImage.findByIdAndUpdate(doc._id, { image: fixed });
  console.log(`  Fixed: ${fixed}`);
}

console.log("\nDone.");
await mongoose.disconnect();
