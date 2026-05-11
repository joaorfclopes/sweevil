/**
 * One-time migration: re-encode all S3 images to AVIF with compression.
 * For store/ images: also composites frontend/public/background.jpg as background.
 *
 * Usage:
 *   node scripts/migrate-s3-to-avif.mjs
 *   node scripts/migrate-s3-to-avif.mjs --dry-run    # preview only, no changes
 *   node scripts/migrate-s3-to-avif.mjs --folder store  # only one folder
 *
 * Idempotent: skips objects that already end in .avif.
 * Safe: uploads new key first, updates MongoDB, then deletes old key.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import sharp from "sharp";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");
const FOLDER_FILTER = (() => {
  const idx = process.argv.indexOf("--folder");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const AVIF_OPTS = { quality: 70, effort: 6 };
const BG_PATH = path.join(__dirname, "../frontend/public/background.jpg");
const STORE_SIZE = 1000;
const GALLERY_SIZE = 2000;

const FOLDERS = ["store", "gallery", "bookings"];

// ── S3 ───────────────────────────────────────────────────────────────────────

function makeS3() {
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks);
}

async function listFolder(s3, folder) {
  const objects = [];
  let token;
  do {
    const res = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET,
        Prefix: `${folder}/`,
        ContinuationToken: token,
      })
    );
    (res.Contents || []).forEach((o) => objects.push(o.Key));
    token = res.IsTruncated ? res.NextContinuationToken : null;
  } while (token);
  return objects;
}

// ── MongoDB ───────────────────────────────────────────────────────────────────

const productSchema = new mongoose.Schema({ images: [String] }, { strict: false });
const gallerySchema = new mongoose.Schema({ image: String }, { strict: false });
const bookingSchema = new mongoose.Schema({ images: [String] }, { strict: false });

let Product, GalleryImage, Booking;

function initModels() {
  Product = mongoose.model("Product", productSchema);
  GalleryImage = mongoose.model("GalleryImage", gallerySchema);
  Booking = mongoose.model("Booking", bookingSchema);
}

async function updateDbUrl(oldUrl, newUrl) {
  if (DRY_RUN) return;
  await Promise.all([
    Product.updateMany({ images: oldUrl }, { $set: { "images.$": newUrl } }),
    GalleryImage.updateMany({ image: oldUrl }, { $set: { image: newUrl } }),
    Booking.updateMany({ images: oldUrl }, { $set: { "images.$": newUrl } }),
  ]);
}

// ── Processing ────────────────────────────────────────────────────────────────

async function processBuffer(buffer, folder) {
  if (folder === "store") {
    const productImg = await sharp(buffer)
      .resize({ width: STORE_SIZE, height: STORE_SIZE, fit: "inside", withoutEnlargement: true })
      .toBuffer();
    return sharp(BG_PATH)
      .resize(STORE_SIZE, STORE_SIZE)
      .composite([{ input: productImg, gravity: "center" }])
      .avif(AVIF_OPTS)
      .toBuffer();
  }
  const size = folder === "gallery" ? GALLERY_SIZE : GALLERY_SIZE;
  return sharp(buffer)
    .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
    .avif(AVIF_OPTS)
    .toBuffer();
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function migrateKey(s3, key, region) {
  if (key.endsWith(".avif")) {
    console.log(`  SKIP (already avif): ${key}`);
    return;
  }

  const ext = path.extname(key);
  const newKey = key.slice(0, key.length - ext.length) + ".avif";
  const oldUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
  const newUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${newKey}`;
  const folder = key.split("/")[0];

  console.log(`  ${DRY_RUN ? "[DRY]" : "PROC"}: ${key} → ${newKey}`);
  if (DRY_RUN) return;

  // Download
  const { Body } = await s3.send(
    new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
  );
  const inputBuffer = await streamToBuffer(Body);

  // Process
  const outputBuffer = await processBuffer(inputBuffer, folder);

  // Upload new key
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: newKey,
      Body: outputBuffer,
      ContentType: "image/avif",
    })
  );

  // Update MongoDB
  await updateDbUrl(oldUrl, newUrl);

  // Delete old key
  await s3.send(
    new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key })
  );

  console.log(`  DONE: ${key}`);
}

async function main() {
  const region = process.env.AWS_REGION || "us-east-1";

  if (!process.env.AWS_S3_BUCKET) throw new Error("AWS_S3_BUCKET not set");
  if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL not set");

  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  if (FOLDER_FILTER) console.log(`Folder filter: ${FOLDER_FILTER}`);

  await mongoose.connect(process.env.MONGODB_URL);
  initModels();
  console.log("MongoDB connected\n");

  const s3 = makeS3();
  const folders = FOLDER_FILTER ? [FOLDER_FILTER] : FOLDERS;

  for (const folder of folders) {
    console.log(`\n── ${folder}/ ──`);
    const keys = await listFolder(s3, folder);
    console.log(`  ${keys.length} objects found`);
    for (const key of keys) {
      await migrateKey(s3, key, region);
    }
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
