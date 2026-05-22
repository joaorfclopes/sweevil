import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import { s3, s3KeyFromUrl } from '../s3.js';
import { isAdmin, isAuth } from '../utils.js';

const bookingUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many upload requests, please try again later.' },
});

const AVIF_QUALITY = parseInt(process.env.AVIF_QUALITY, 10) || 65;
const AVIF_EFFORT = parseInt(process.env.AVIF_EFFORT, 10) || 4;
const IMAGE_MAX_SIZE = parseInt(process.env.IMAGE_MAX_SIZE, 10) || 1000;

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: Image upload and deletion via S3
 */

const uploadRouter = express.Router();

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/bmp',
  'image/heic',
  'image/heif',
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Only image files (jpeg, png, webp, gif, avif, tiff, bmp, heic, heif) are allowed'),
      false
    );
  }
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

const bookingMemoryUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { files: 10, fileSize: 5 * 1024 * 1024 },
});

/**
 * @swagger
 * /upload/s3:
 *   post:
 *     summary: Upload a single image to S3 (store or gallery folder)
 *     tags: [Upload]
 *     parameters:
 *       - in: query
 *         name: folder
 *         schema: { type: string, enum: [store, gallery], default: store }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Uploaded image URL (and dimensions for gallery images)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 location: { type: string }
 *                 width: { type: integer }
 *                 height: { type: integer }
 *       400:
 *         description: No file uploaded
 */
uploadRouter.post('/s3', isAuth, isAdmin, (req, res, next) => {
  memoryUpload.single('image')(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    try {
      const ALLOWED_FOLDERS = ['store', 'gallery'];
      const folder = ALLOWED_FOLDERS.includes(req.query.folder) ? req.query.folder : 'store';
      const key = `${folder}/${randomUUID()}.avif`;

      let processed;
      let galleryDimensions = {};
      if (folder === 'store') {
        const bgPath = path.join(path.resolve(), 'frontend', 'public', 'background.png');
        const productImg = await sharp(req.file.buffer)
          .resize({
            width: IMAGE_MAX_SIZE,
            height: IMAGE_MAX_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toBuffer();
        processed = await sharp(bgPath)
          .resize(IMAGE_MAX_SIZE, IMAGE_MAX_SIZE)
          .composite([{ input: productImg, gravity: 'center' }])
          .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
          .toBuffer();
      } else {
        const { data: imgData, info } = await sharp(req.file.buffer)
          .resize({
            width: IMAGE_MAX_SIZE,
            height: IMAGE_MAX_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
          .toBuffer({ resolveWithObject: true });
        processed = imgData;
        galleryDimensions = { width: info.width, height: info.height };
      }

      const region = process.env.AWS_REGION || 'us-east-1';
      const location = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
      if (process.env.MOCK_S3 === 'true') {
        console.log(`[s3:mock] Skipped upload to ${folder}/ — ${key}`);
      } else {
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: processed,
            ContentType: 'image/avif',
          })
        );
        console.log(`[upload] Image uploaded to ${folder}/ — ${key}`);
      }
      res.json({ location, ...galleryDimensions });
    } catch (processingErr) {
      next(processingErr);
    }
  });
});

/**
 * @swagger
 * /upload/booking-images:
 *   post:
 *     summary: Upload up to 10 booking reference images to S3 (public — no auth required)
 *     tags: [Upload]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [images]
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Array of uploaded image URLs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items: { type: string }
 *       400:
 *         description: No files uploaded
 *       429:
 *         description: Rate limit exceeded
 */
uploadRouter.post('/booking-images', bookingUploadLimiter, (req, res, next) => {
  bookingMemoryUpload.array('images', 10)(req, res, async (err) => {
    if (err) return next(err);
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    try {
      const region = process.env.AWS_REGION || 'us-east-1';
      const urls = await Promise.all(
        req.files.map(async (file) => {
          const key = `bookings/${randomUUID()}.avif`;
          const processed = await sharp(file.buffer)
            .resize({
              width: IMAGE_MAX_SIZE,
              height: IMAGE_MAX_SIZE,
              fit: 'inside',
              withoutEnlargement: true,
            })
            .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
            .toBuffer();
          const url = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
          if (process.env.MOCK_S3 !== 'true') {
            await s3.send(
              new PutObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: key,
                Body: processed,
                ContentType: 'image/avif',
              })
            );
          } else {
            console.log(`[s3:mock] Skipped booking upload — ${key}`);
          }
          return url;
        })
      );
      console.log(`[upload] ${urls.length} booking image(s) uploaded`);
      res.json({ urls });
    } catch (processingErr) {
      next(processingErr);
    }
  });
});

/**
 * @swagger
 * /upload/s3:
 *   delete:
 *     summary: Delete an image from S3 by URL (store and gallery folders only)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [url]
 *             properties:
 *               url: { type: string, description: Full S3 URL of the image to delete }
 *     responses:
 *       200:
 *         description: Image deleted
 *       400:
 *         description: Missing or invalid URL
 *       500:
 *         description: S3 deletion error
 */
uploadRouter.delete('/s3', isAuth, isAdmin, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'url is required' });
  try {
    const key = s3KeyFromUrl(url);
    if (!key || (!key.startsWith('store/') && !key.startsWith('gallery/'))) {
      return res.status(400).json({ message: 'Invalid key' });
    }
    if (process.env.MOCK_S3 === 'true') {
      console.log(`[s3:mock] Skipped delete — ${key}`);
    } else {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
      console.log(`[upload] Image deleted — ${key}`);
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default uploadRouter;
