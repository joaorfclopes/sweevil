import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { cacheDel, cacheGet, cacheSet } from '../cache.js';
import GalleryImage from '../models/galleryImageModel.js';
import { deleteFromS3 } from '../s3.js';
import { isAdmin, isAuth } from '../utils.js';

const galleryImageRouter = express.Router();
const CACHE_KEY = 'gallery:list';
const TTL = 60 * 10;

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

galleryImageRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { image, description, category, width, height } = req.body;
    await GalleryImage.updateMany({}, { $inc: { order: 1 } });
    const galleryImage = new GalleryImage({
      image,
      description: description || '',
      category,
      order: 0,
      ...(width && height ? { width, height } : {}),
    });
    const created = await galleryImage.save();
    await cacheDel(CACHE_KEY);
    res.status(201).json(created);
  })
);

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
    const { description, category } = req.body;
    galleryImage.description = description ?? galleryImage.description;
    galleryImage.category = category ?? galleryImage.category;
    const updated = await galleryImage.save();
    await cacheDel(CACHE_KEY);
    res.json(updated);
  })
);

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
