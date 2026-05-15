import express from "express";
import geoip from "geoip-lite";

const geoRouter = express.Router();

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"]);

geoRouter.get("/", (req, res) => {
  // req.ip is the correct client IP when trust proxy is configured on the app.
  // Manually reading x-forwarded-for would allow clients to spoof their country.
  if (LOOPBACK.has(req.ip) && process.env.GEO_DEFAULT_COUNTRY) {
    return res.json({ country: process.env.GEO_DEFAULT_COUNTRY });
  }
  const geo = geoip.lookup(req.ip);
  res.json({ country: geo?.country || null });
});

export default geoRouter;
