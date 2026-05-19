import express from 'express';
import { cacheDel, cacheGet, cacheSet } from '../cache.js';
import About from '../models/aboutModel.js';
import { isAdmin, isAuth } from '../utils.js';

const aboutRouter = express.Router();
const CACHE_KEY = 'about:single';
const TTL = 60 * 30;

aboutRouter.get('/', async (req, res) => {
  const cached = await cacheGet(CACHE_KEY);
  if (cached) return res.json(cached);
  const about = await About.findOne();
  const result = about || { title: "Who's Sweevil?", body: '' };
  await cacheSet(CACHE_KEY, result, TTL);
  res.json(result);
});

aboutRouter.put('/', isAuth, isAdmin, async (req, res) => {
  const { title, body } = req.body;
  const about = await About.findOneAndUpdate({}, { title, body }, { upsert: true, new: true });
  await cacheDel(CACHE_KEY);
  res.json(about);
});

export default aboutRouter;
