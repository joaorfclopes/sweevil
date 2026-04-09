/**
 * One-time migration script: upload local gallery images to S3 and update MongoDB.
 *
 * Usage:
 *   node scripts/migrate-gallery-to-s3.mjs
 *
 * Add --dry-run to preview what would happen without making any changes:
 *   node scripts/migrate-gallery-to-s3.mjs --dry-run
 *
 * Requires the same .env as the backend (MONGODB_URL, AWS_REGION,
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY).
 */

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import mime from "mime-types";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");
const IMAGES_DIR = path.join(__dirname, "../frontend/public/images");
const S3_BUCKET = "sweevil";
const S3_PREFIX = "store/";

// ── MongoDB ──────────────────────────────────────────────────────────────────

const gallerySchema = new mongoose.Schema(
  {
    image: String,
    description: String,
    category: String,
    order: Number,
  },
  { timestamps: true }
);
const GalleryImage = mongoose.model("Gallery", gallerySchema);

// ── S3 ───────────────────────────────────────────────────────────────────────

const s3 = new S3Client({
  region: process.env.AWS_REGION || "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function uploadToS3(filePath, filename) {
  const fileBuffer = fs.readFileSync(filePath);
  const contentType = mime.lookup(filename) || "image/jpeg";
  const key = S3_PREFIX + filename;

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: "public-read",
    })
  );

  return `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || "eu-west-3"}.amazonaws.com/${key}`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN ? "🔍  DRY RUN — no changes will be made\n" : "🚀  Starting migration\n");

  await mongoose.connect(process.env.MONGODB_URL);
  console.log("✅  Connected to MongoDB\n");

  // Find all docs with local image paths
  const docs = await GalleryImage.find({ image: /^\/images\// });
  console.log(`Found ${docs.length} gallery image(s) with local paths.\n`);

  if (docs.length === 0) {
    console.log("Nothing to migrate. Exiting.");
    await mongoose.disconnect();
    return;
  }

  const results = { success: [], missing: [], failed: [] };

  for (const doc of docs) {
    const filename = path.basename(doc.image); // e.g. "tattoo1.jpg"
    const localPath = path.join(IMAGES_DIR, filename);

    process.stdout.write(`  ${filename} ... `);

    if (!fs.existsSync(localPath)) {
      console.log("⚠️  file not found locally — skipped");
      results.missing.push(filename);
      continue;
    }

    if (DRY_RUN) {
      console.log(`would upload → ${S3_PREFIX}${filename}`);
      results.success.push(filename);
      continue;
    }

    try {
      const s3Url = await uploadToS3(localPath, filename);
      await GalleryImage.findByIdAndUpdate(doc._id, { image: s3Url });
      console.log(`✅  ${s3Url}`);
      results.success.push(filename);
    } catch (err) {
      console.log(`❌  ${err.message}`);
      results.failed.push(filename);
    }
  }

  console.log("\n── Summary ──────────────────────────────────────────────────");
  console.log(`  Migrated : ${results.success.length}`);
  console.log(`  Missing  : ${results.missing.length}${results.missing.length ? " → " + results.missing.join(", ") : ""}`);
  console.log(`  Failed   : ${results.failed.length}${results.failed.length ? " → " + results.failed.join(", ") : ""}`);

  if (!DRY_RUN && results.success.length > 0) {
    console.log("\n✅  Migration complete.");
    console.log("   You can now safely delete frontend/public/images/ and remove it from git:");
    console.log("   git rm -r frontend/public/images/");
    console.log("   git commit -m 'chore: remove local gallery images (migrated to S3)'");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
