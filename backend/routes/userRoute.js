import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import { isAuth } from '../utils.js';

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User passkey management
 */

const userRouter = express.Router();

/**
 * @swagger
 * /users/passkey-challenge:
 *   delete:
 *     summary: Clear pending passkey registration challenges for the current user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Challenges cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 */
userRouter.delete(
  '/passkey-challenge',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const db = mongoose.connection.getClient().db();
    await db.collection('verification').deleteMany({
      value: { $regex: req.user._id },
    });
    res.json({ success: true });
  })
);

/**
 * @swagger
 * /users/passkey-signin-challenge:
 *   delete:
 *     summary: Clear stale passkey sign-in challenges (public — clears challenges with empty id)
 *     tags: [Users]
 *     security: []
 *     responses:
 *       200:
 *         description: Stale challenges cleared
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 */
userRouter.delete(
  '/passkey-signin-challenge',
  expressAsyncHandler(async (req, res) => {
    const db = mongoose.connection.getClient().db();
    await db.collection('verification').deleteMany({
      value: { $regex: '"id":""' },
    });
    res.json({ success: true });
  })
);

export default userRouter;
