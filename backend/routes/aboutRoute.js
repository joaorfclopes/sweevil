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
 *                 en: { type: object, properties: { title: { type: string }, body: { type: string } } }
 *                 pt: { type: object, properties: { title: { type: string }, body: { type: string } } }
 */
aboutRouter.get('/', async (req, res) => {
  const cached = await cacheGet(CACHE_KEY);
  if (cached) return res.json(cached);
  let about = await About.findOne();
  // Migrate old flat schema to bilingual
  if (about && about.title !== undefined && !about.en) {
    about = await About.findOneAndUpdate(
      {},
      {
        $set: {
          en: { title: about.title, body: about.body || '' },
          pt: { title: about.title, body: about.body || '' },
        },
        $unset: { title: '', body: '' },
      },
      { returnDocument: 'after' }
    );
  }
  const result = about || {
    en: { title: "Who's Sweevil?", body: '' },
    pt: { title: 'Quem é Sweevil?', body: '' },
  };
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
 *             required: [en, pt]
 *             properties:
 *               en: { type: object, properties: { title: { type: string }, body: { type: string } } }
 *               pt: { type: object, properties: { title: { type: string }, body: { type: string } } }
 *     responses:
 *       200:
 *         description: About page content updated
 */
aboutRouter.put('/', isAuth, isAdmin, async (req, res) => {
  const { en, pt } = req.body;
  const about = await About.findOneAndUpdate(
    {},
    { en, pt },
    { upsert: true, returnDocument: 'after' }
  );
  await cacheDel(CACHE_KEY);
  res.json(about);
});

export default aboutRouter;
