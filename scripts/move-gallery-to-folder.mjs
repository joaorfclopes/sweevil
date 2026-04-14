/**
 * One-time migration script: move gallery images from store/ to gallery/ in S3 and update MongoDB.
 *
 * Usage:
 *   node scripts/move-gallery-to-folder.mjs
 *
 * Add --dry-run to preview what would happen without making any changes:
 *   node scripts/move-gallery-to-folder.mjs --dry-run
 *
 * Requires the same .env as the backend (MONGODB_URL, AWS_REGION,
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET).
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import {
  S3Client,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

dotenv.config();

const DRY_RUN = process.argv.includes("--dry-run");
const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION || "eu-west-3";

// ── MongoDB ──────────────────────────────────────────────────────────────────

const gallerySchema = new mongoose.Schema(
  {
    image: String,
    description: String,
    category: String,
    order: Number,
  },
  { timestamps: true },
);
const GalleryImage = mongoose.model("Gallery", gallerySchema);

// ── S3 ───────────────────────────────────────────────────────────────────────

const s3ClientConfig = { region: REGION };
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3ClientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}
const s3 = new S3Client(s3ClientConfig);

function keyFromUrl(url) {
  try {
    return new URL(url).pathname.slice(1); // strips leading "/"
  } catch {
    return null;
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(
    DRY_RUN
      ? "🔍  DRY RUN — no changes will be made\n"
      : "🚀  Starting migration\n",
  );

  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅  Connected to MongoDB\n");

  // Find all gallery docs whose image URL is in store/
  const docs = await GalleryImage.find({ image: /\/store\// });
  console.log(`Found ${docs.length} gallery image(s) in store/.\n`);

  if (docs.length === 0) {
    console.log("Nothing to migrate. Exiting.");
    await mongoose.disconnect();
    return;
  }

  const results = { success: [], failed: [] };

  for (const doc of docs) {
    const oldKey = keyFromUrl(doc.image);
    if (!oldKey) {
      console.log(`  ⚠️  Could not parse URL for doc ${doc._id} — skipped`);
      continue;
    }

    const filename = path.basename(oldKey);
    const newKey = "gallery/" + filename;
    const newUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${newKey}`;

    process.stdout.write(`  ${filename}: store/ → gallery/ ... `);

    if (DRY_RUN) {
      console.log(`would move → ${newUrl}`);
      results.success.push(filename);
      continue;
    }

    try {
      // Copy to gallery/
      await s3.send(
        new CopyObjectCommand({
          Bucket: BUCKET,
          CopySource: `${BUCKET}/${oldKey}`,
          Key: newKey,
        }),
      );

      // Update MongoDB
      await GalleryImage.findByIdAndUpdate(doc._id, { image: newUrl });

      // Delete old object from store/
      await s3.send(
        new DeleteObjectCommand({ Bucket: BUCKET, Key: oldKey }),
      );

      console.log("✅");
      results.success.push(filename);
    } catch (err) {
      console.log(`❌  ${err.message}`);
      results.failed.push(filename);
    }
  }

  console.log("\n── Summary ──────────────────────────────────────────────────");
  console.log(`  Moved  : ${results.success.length}`);
  console.log(
    `  Failed : ${results.failed.length}${results.failed.length ? " → " + results.failed.join(", ") : ""}`,
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
