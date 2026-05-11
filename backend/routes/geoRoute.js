import express from "express";
import geoip from "geoip-lite";

const geoRouter = express.Router();

geoRouter.get("/", (req, res) => {
  // req.ip is the correct client IP when trust proxy is configured on the app.
  // Manually reading x-forwarded-for would allow clients to spoof their country.
  const geo = geoip.lookup(req.ip);
  res.json({ country: geo?.country || null });
});

export default geoRouter;
