import express from 'express';
import { cacheDel, cacheGet, cacheSet } from '../cache.js';
import About from '../models/aboutModel.js';
import { isAdmin, isAuth } from '../utils.js';

/**
 * @swagger
 * tags:
 *   name: About
 *   description: About page content management
 */

const aboutRouter = express.Router();
const CACHE_KEY = 'about:single';
const TTL = 60 * 30;

/**
 * @swagger
 * /about:
 *   get:
 *     summary: Get the about page content
 *     tags: [About]
 *     security: []
 *     responses:
 *       200:
 *         description: About page content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 title: { type: string }
 *                 body: { type: string }
 */
aboutRouter.get('/', async (req, res) => {
  const cached = await cacheGet(CACHE_KEY);
  if (cached) return res.json(cached);
  const about = await About.findOne();
  const result = about || { title: "Who's Sweevil?", body: '' };
  await cacheSet(CACHE_KEY, result, TTL);
  res.json(result);
});

/**
 * @swagger
 * /about:
 *   put:
 *     summary: Update the about page content (upserts a single document)
 *     tags: [About]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, body]
 *             properties:
 *               title: { type: string }
 *               body: { type: string }
 *     responses:
 *       200:
 *         description: About page content updated
 */
aboutRouter.put('/', isAuth, isAdmin, async (req, res) => {
  const { title, body } = req.body;
  const about = await About.findOneAndUpdate(
    {},
    { title, body },
    { upsert: true, returnDocument: 'after' }
  );
  await cacheDel(CACHE_KEY);
  res.json(about);
});

export default aboutRouter;
