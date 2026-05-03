import express from "express";
import geoip from "geoip-lite";

const geoRouter = express.Router();

geoRouter.get("/", (req, res) => {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.ip;
  const geo = geoip.lookup(ip);
  res.json({ country: geo?.country || null });
});

export default geoRouter;
