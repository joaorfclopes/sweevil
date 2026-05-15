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

uploadRouter.post('/s3', isAuth, isAdmin, (req, res, next) => {
  memoryUpload.single('image')(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    try {
      const ALLOWED_FOLDERS = ['store', 'gallery'];
      const folder = ALLOWED_FOLDERS.includes(req.query.folder) ? req.query.folder : 'store';
      const key = `${folder}/${randomUUID()}.avif`;

      let processed;
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
        processed = await sharp(req.file.buffer)
          .resize({
            width: IMAGE_MAX_SIZE,
            height: IMAGE_MAX_SIZE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .avif({ quality: AVIF_QUALITY, effort: AVIF_EFFORT })
          .toBuffer();
      }

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: key,
          Body: processed,
          ContentType: 'image/avif',
        })
      );

      const region = process.env.AWS_REGION || 'us-east-1';
      const location = `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
      console.log(`[upload] Image uploaded to ${folder}/ — ${key}`);
      res.json({ location });
    } catch (processingErr) {
      next(processingErr);
    }
  });
});

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
          await s3.send(
            new PutObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET,
              Key: key,
              Body: processed,
              ContentType: 'image/avif',
            })
          );
          return `https://${process.env.AWS_S3_BUCKET}.s3.${region}.amazonaws.com/${key}`;
        })
      );
      console.log(`[upload] ${urls.length} booking image(s) uploaded`);
      res.json({ urls });
    } catch (processingErr) {
      next(processingErr);
    }
  });
});

uploadRouter.delete('/s3', isAuth, isAdmin, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'url is required' });
  try {
    const key = s3KeyFromUrl(url);
    if (!key || (!key.startsWith('store/') && !key.startsWith('gallery/'))) {
      return res.status(400).json({ message: 'Invalid key' });
    }
    await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }));
    console.log(`[upload] Image deleted — ${key}`);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default uploadRouter;
