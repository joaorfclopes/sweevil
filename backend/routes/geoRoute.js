import express from 'express';
import geoip from 'geoip-lite';

/**
 * @swagger
 * tags:
 *   name: Geo
 *   description: IP geolocation for shipping country detection
 */

const geoRouter = express.Router();

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/**
 * @swagger
 * /geo:
 *   get:
 *     summary: Detect the caller's country from their IP address
 *     tags: [Geo]
 *     security: []
 *     responses:
 *       200:
 *         description: ISO 3166-1 alpha-2 country code or null if unknown
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 country:
 *                   type: string
 *                   nullable: true
 *                   example: PT
 */
geoRouter.get('/', (req, res) => {
  // req.ip is the correct client IP when trust proxy is configured on the app.
  // Manually reading x-forwarded-for would allow clients to spoof their country.
  if (LOOPBACK.has(req.ip) && process.env.GEO_DEFAULT_COUNTRY) {
    return res.json({ country: process.env.GEO_DEFAULT_COUNTRY });
  }
  const geo = geoip.lookup(req.ip);
  res.json({ country: geo?.country || null });
});

export default geoRouter;
