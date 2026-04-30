import express from "express";
import expressAsyncHandler from "express-async-handler";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import data from "../data.js";
import User from "../models/userModel.js";
import { generateToken, isAuth, isAdmin } from "../utils.js";

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const signinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many signin attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const userRouter = express.Router();

// Seed route - only available in development
if (process.env.NODE_ENV !== 'production') {
  userRouter.get(
    "/seed",
    expressAsyncHandler(async (req, res) => {
      const createdUsers = await User.insertMany(data.users);
      res.send({ createdUsers });
    })
  );
}

userRouter.post(
  "/signin",
  signinLimiter,
  expressAsyncHandler(async (req, res) => {
    if (typeof req.body.email !== "string" || typeof req.body.password !== "string") {
      return res.status(401).send({ message: "Invalid user email or password" });
    }
    const emailLower = req.body.email.toLowerCase();
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(emailLower)) {
      return res.status(403).send({ message: "Access denied" });
    }
    const user = await User.findOne({ email: emailLower });
    if (user) {
      if (user.passkeys && user.passkeys.length > 0) {
        return res.status(401).send({ message: "Password sign-in is disabled. Use your passkey." });
      }
      if (user.password && bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: "Invalid user email or password" });
  })
);

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    const emailLower = (req.body.email || "").toLowerCase();
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(emailLower)) {
      return res.status(403).send({ message: "Registration not allowed for this email" });
    }
    const userFields = {
      name: req.body.name,
      email: emailLower,
      phoneNumber: req.body.phoneNumber,
    };
    if (req.body.password) {
      userFields.password = bcrypt.hashSync(req.body.password, 8);
    }
    const user = new User(userFields);
    try {
      const createdUser = await user.save();
      res.send({
        _id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        phoneNumber: createdUser.phoneNumber,
        isAdmin: createdUser.isAdmin,
        token: generateToken(createdUser),
      });
    } catch (error) {
      res.status(401).send({ message: "Email or Phone Number already in use" });
    }
  })
);

userRouter.post(
  "/remove-passwords",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const result = await User.updateMany({}, { $unset: { password: "" } });
    res.send({ message: `Passwords removed from ${result.modifiedCount} user(s)` });
  })
);

userRouter.get(
  "/:id",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    // Check if user is requesting their own profile or is an admin
    if (req.params.id !== req.user._id && !req.user.isAdmin) {
      return res.status(403).send({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  })
);

userRouter.put(
  "/profile",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
        if (req.body.password) {
          user.password = bcrypt.hashSync(req.body.password, 8);
        }
        const updatedUser = await user.save();
        res.send({
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          phoneNumber: updatedUser.phoneNumber,
          isAdmin: updatedUser.isAdmin,
          token: generateToken(updatedUser),
        });
      } else {
        res.status(404).send({ message: "User not found" });
      }
    } catch (error) {
      res.status(404).send({ message: "Error updating user" });
    }
  })
);

export default userRouter;
