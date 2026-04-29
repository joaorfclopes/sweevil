import express from "express";
import About from "../models/aboutModel.js";
import { isAuth, isAdmin } from "../utils.js";

const aboutRouter = express.Router();

aboutRouter.get("/", async (req, res) => {
  const about = await About.findOne();
  res.json(about || { title: "Who's Sweevil?", body: "" });
});

aboutRouter.put("/", isAuth, isAdmin, async (req, res) => {
  const { title, body } = req.body;
  const about = await About.findOneAndUpdate(
    {},
    { title, body },
    { upsert: true, new: true }
  );
  res.json(about);
});

export default aboutRouter;
