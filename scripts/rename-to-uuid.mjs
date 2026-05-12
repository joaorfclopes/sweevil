/**
 * One-time migration: rename all S3 image keys to UUID format.
 * Updates MongoDB URLs to match new keys.
 *
 * Usage:
 *   node scripts/rename-to-uuid.mjs                    # all folders
 *   node scripts/rename-to-uuid.mjs --dry-run          # preview only
 *   node scripts/rename-to-uuid.mjs --folder gallery   # one folder
 */

import dotenv from "dotenv";
import mongoose from "mongoose";
import { randomUUID } from "crypto";
import path from "path";
import {
  S3Client,
  ListObjectsV2Command,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

const DRY_RUN = process.argv.includes("--dry-run");
const FOLDER_FILTER = (() => {
  const idx = process.argv.indexOf("--folder");
  return idx !== -1 ? process.argv[idx + 1] : null;
})();

const FOLDERS = ["store", "gallery", "bookings"];

const productSchema = new mongoose.Schema({ images: [String] }, { strict: false });
const gallerySchema = new mongoose.Schema({ image: String }, { strict: false });
const bookingSchema = new mongoose.Schema({ images: [String] }, { strict: false });

const Product = mongoose.model("Product", productSchema);
const GalleryImage = mongoose.model("Gallery", gallerySchema);
const Booking = mongoose.model("Booking", bookingSchema);

function makeS3() {
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
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

function isUuid(name) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(name);
}

async function updateDbUrl(oldUrl, newUrl) {
  await Promise.all([
    Product.updateMany({ images: oldUrl }, { $set: { "images.$": newUrl } }),
    GalleryImage.updateMany({ image: oldUrl }, { $set: { image: newUrl } }),
    Booking.updateMany({ images: oldUrl }, { $set: { "images.$": newUrl } }),
  ]);
}

async function main() {
  const region = process.env.AWS_REGION || "us-east-1";
  const bucket = process.env.AWS_S3_BUCKET;

  if (!bucket) throw new Error("AWS_S3_BUCKET not set");
  if (!process.env.MONGODB_URL) throw new Error("MONGODB_URL not set");

  console.log(`Mode: ${DRY_RUN ? "DRY RUN" : "LIVE"}`);
  if (FOLDER_FILTER) console.log(`Folder filter: ${FOLDER_FILTER}`);

  await mongoose.connect(process.env.MONGODB_URL);
  console.log("MongoDB connected\n");

  const s3 = makeS3();
  const folders = FOLDER_FILTER ? [FOLDER_FILTER] : FOLDERS;
  const failed = [];

  for (const folder of folders) {
    console.log(`\n── ${folder}/ ──`);
    const keys = await listFolder(s3, folder);
    console.log(`  ${keys.length} objects found`);

    for (const key of keys) {
      if (key.endsWith("/")) continue;

      const ext = path.extname(key);
      const baseName = path.basename(key, ext);

      if (isUuid(baseName)) {
        console.log(`  SKIP (already uuid): ${key}`);
        continue;
      }

      const newKey = `${folder}/${randomUUID()}${ext}`;
      const oldUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
      const newUrl = `https://${bucket}.s3.${region}.amazonaws.com/${newKey}`;

      console.log(`  ${DRY_RUN ? "[DRY]" : "PROC"}: ${key}\n         → ${newKey}`);
      if (DRY_RUN) continue;

      try {
        const encodedKey = key.split("/").map(encodeURIComponent).join("/");
        await s3.send(
          new CopyObjectCommand({
            Bucket: bucket,
            CopySource: `${bucket}/${encodedKey}`,
            Key: newKey,
          })
        );
        await updateDbUrl(oldUrl, newUrl);
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
        console.log(`  DONE: ${key}`);
      } catch (err) {
        console.error(`  FAIL: ${key} — ${err.message}`);
        failed.push(key);
      }
    }
  }

  if (failed.length > 0) {
    console.log(`\n── Failed (${failed.length}) ──`);
    failed.forEach((k) => console.log(`  ${k}`));
  }

  await mongoose.disconnect();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
