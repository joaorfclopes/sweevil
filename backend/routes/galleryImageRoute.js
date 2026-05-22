import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { cacheDel, cacheGet, cacheSet } from '../cache.js';
import GalleryImage from '../models/galleryImageModel.js';
import { deleteFromS3 } from '../s3.js';
import { isAdmin, isAuth } from '../utils.js';

/**
 * @swagger
 * tags:
 *   name: Gallery
 *   description: Gallery image management
 */

const galleryImageRouter = express.Router();
const CACHE_KEY = 'gallery:list';
const TTL = 60 * 10;

/**
 * @swagger
 * /gallery:
 *   get:
 *     summary: List all gallery images sorted by order
 *     tags: [Gallery]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of gallery images
 */
galleryImageRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const cached = await cacheGet(CACHE_KEY);
    if (cached) return res.json(cached);
    const gallery = await GalleryImage.find({}).sort({ order: 1, createdAt: 1 });
    await cacheSet(CACHE_KEY, gallery, TTL);
    res.json(gallery);
  })
);

/**
 * @swagger
 * /gallery:
 *   post:
 *     summary: Add a new gallery image (prepended at order 0)
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [image, category]
 *             properties:
 *               image: { type: string, description: S3 URL }
 *               description: { type: string }
 *               category: { type: string }
 *               width: { type: integer }
 *               height: { type: integer }
 *     responses:
 *       201:
 *         description: Gallery image created
 */
galleryImageRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const {
      image,
      description,
      descriptionEn,
      descriptionPt,
      useDescriptionTranslation,
      category,
      width,
      height,
    } = req.body;
    await GalleryImage.updateMany({}, { $inc: { order: 1 } });
    const galleryImage = new GalleryImage({
      image,
      description: description || '',
      descriptionEn,
      descriptionPt,
      useDescriptionTranslation,
      category,
      order: 0,
      ...(width && height ? { width, height } : {}),
    });
    const created = await galleryImage.save();
    await cacheDel(CACHE_KEY);
    res.status(201).json(created);
  })
);

/**
 * @swagger
 * /gallery/reorder:
 *   patch:
 *     summary: Bulk-update gallery image display order
 *     tags: [Gallery]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [_id, order]
 *                   properties:
 *                     _id: { type: string }
 *                     order: { type: integer }
 *     responses:
 *       200:
 *         description: Order updated
 *       400:
 *         description: Items must be an array
 */
galleryImageRouter.patch(
  '/reorder',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { items } = req.body; // [{ _id, order }]
    if (!Array.isArray(items)) {
      res.status(400).json({ message: 'Items must be an array' });
      return;
    }
    await Promise.all(
      items.map(({ _id, order }) => GalleryImage.findByIdAndUpdate(_id, { order }))
    );
    await cacheDel(CACHE_KEY);
    res.json({ message: 'Order updated' });
  })
);

/**
 * @swagger
 * /gallery/{id}:
 *   put:
 *     summary: Update a gallery image's description or category
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Gallery image updated
 *       404:
 *         description: Image not found
 */
galleryImageRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const galleryImage = await GalleryImage.findById(req.params.id);
    if (!galleryImage) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }
    const { description, descriptionEn, descriptionPt, useDescriptionTranslation, category } =
      req.body;
    galleryImage.description = description ?? galleryImage.description;
    galleryImage.descriptionEn = descriptionEn ?? galleryImage.descriptionEn;
    galleryImage.descriptionPt = descriptionPt ?? galleryImage.descriptionPt;
    galleryImage.useDescriptionTranslation =
      useDescriptionTranslation ?? galleryImage.useDescriptionTranslation;
    galleryImage.category = category ?? galleryImage.category;
    const updated = await galleryImage.save();
    await cacheDel(CACHE_KEY);
    res.json(updated);
  })
);

/**
 * @swagger
 * /gallery/{id}:
 *   delete:
 *     summary: Delete a gallery image and its S3 file
 *     tags: [Gallery]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Image deleted
 *       404:
 *         description: Image not found
 */
galleryImageRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const galleryImage = await GalleryImage.findById(req.params.id);
    if (!galleryImage) {
      res.status(404).json({ message: 'Image not found' });
      return;
    }
    await galleryImage.deleteOne();
    await deleteFromS3(galleryImage.image);
    await cacheDel(CACHE_KEY);
    res.json({ message: 'Image deleted' });
  })
);

export default galleryImageRouter;
