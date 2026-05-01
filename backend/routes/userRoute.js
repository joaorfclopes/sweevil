import express from "express";
import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import data from "../data.js";
import User from "../models/userModel.js";
import { isAuth } from "../utils.js";

const userRouter = express.Router();

userRouter.delete(
  "/passkey-challenge",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const db = mongoose.connection.getClient().db();
    await db.collection("verification").deleteMany({
      value: { $regex: req.user._id },
    });
    res.json({ success: true });
  })
);

userRouter.delete(
  "/passkey-signin-challenge",
  expressAsyncHandler(async (req, res) => {
    const db = mongoose.connection.getClient().db();
    await db.collection("verification").deleteMany({
      value: { $regex: '"id":""' },
    });
    res.json({ success: true });
  })
);

if (process.env.NODE_ENV !== "production") {
  userRouter.get(
    "/seed",
    expressAsyncHandler(async (req, res) => {
      const createdUsers = await User.insertMany(data.users);
      res.send({ createdUsers });
    })
  );
}

export default userRouter;
