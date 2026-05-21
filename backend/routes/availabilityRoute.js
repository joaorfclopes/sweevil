import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Availability from '../models/availabilityModel.js';
import Booking from '../models/bookingModel.js';
import { isAdmin, isAuth } from '../utils.js';

/**
 * @swagger
 * tags:
 *   name: Availability
 *   description: Tattoo booking availability management
 */

const availabilityRouter = express.Router();

/**
 * @swagger
 * /availability:
 *   get:
 *     summary: List all available dates with slots and booking status
 *     tags: [Availability]
 *     security: []
 *     responses:
 *       200:
 *         description: Array of availability records with booked-slot markers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id: { type: string }
 *                   date: { type: string, format: date-time }
 *                   price: { type: number }
 *                   slots:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         time: { type: string }
 *                         isAvailable: { type: boolean }
 *                         isBooked: { type: boolean }
 */
availabilityRouter.get(
  '/',
  expressAsyncHandler(async (req, res) => {
    const availability = await Availability.find({}).sort({ date: 1 });
    const dates = availability.map((a) => a.date);
    const bookings = await Booking.find({ date: { $in: dates }, status: 'CONFIRMED' });
    const bookingsByDate = bookings.reduce((acc, b) => {
      const key = b.date.toISOString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(b.slot);
      return acc;
    }, {});
    const result = availability.map((avail) => {
      const bookedSlots = bookingsByDate[avail.date.toISOString()] || [];
      return {
        _id: avail._id,
        date: avail.date,
        price: avail.price,
        slots: avail.slots.map((s) => ({
          time: s.time,
          isAvailable: s.isAvailable,
          isBooked: bookedSlots.includes(s.time),
        })),
      };
    });
    res.json(result);
  })
);

/**
 * @swagger
 * /availability:
 *   post:
 *     summary: Add an availability date with slots
 *     tags: [Availability]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, slots, price]
 *             properties:
 *               date: { type: string, format: date }
 *               price: { type: number }
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string }
 *                     isAvailable: { type: boolean }
 *     responses:
 *       201:
 *         description: Availability created
 *       400:
 *         description: Availability already exists for this date or invalid slots
 */
availabilityRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { date, slots, price } = req.body;
    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: 'slots must be an array' });
    }
    const existing = await Availability.findOne({ date: new Date(date) });
    if (existing) {
      return res.status(400).json({ message: 'Availability already exists for this date' });
    }
    const availability = new Availability({
      date: new Date(date),
      slots,
      price,
    });
    const created = await availability.save();
    console.log(
      `[availability] Added ${new Date(date).toISOString().split('T')[0]} — €${price}, ${slots.length} slot(s)`
    );
    res.status(201).json(created);
  })
);

/**
 * @swagger
 * /availability/bulk:
 *   post:
 *     summary: Add availability for multiple dates at once (skips already-existing dates)
 *     tags: [Availability]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [dates, slots, price]
 *             properties:
 *               dates:
 *                 type: array
 *                 items: { type: string, format: date }
 *               price: { type: number }
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string }
 *                     isAvailable: { type: boolean }
 *     responses:
 *       201:
 *         description: Bulk creation result with created and skipped date lists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 created: { type: array, items: { type: string } }
 *                 skipped: { type: array, items: { type: string } }
 *       400:
 *         description: Invalid dates or slots
 */
availabilityRouter.post(
  '/bulk',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { dates, slots, price } = req.body;
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: 'dates must be a non-empty array' });
    }
    if (!Array.isArray(slots)) {
      return res.status(400).json({ message: 'slots must be an array' });
    }
    const created = [];
    const skipped = [];
    for (const dateStr of dates) {
      const existing = await Availability.findOne({ date: new Date(dateStr) });
      if (existing) {
        skipped.push(dateStr);
        continue;
      }
      const avail = new Availability({ date: new Date(dateStr), slots, price });
      await avail.save();
      created.push(dateStr);
    }
    console.log(
      `[availability] Bulk added ${created.length} date(s), skipped ${skipped.length} — €${price}, ${slots.length} slot(s)`
    );
    res.status(201).json({ created, skipped });
  })
);

/**
 * @swagger
 * /availability/{id}:
 *   put:
 *     summary: Update slots or price for an availability date
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price: { type: number }
 *               slots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     time: { type: string }
 *                     isAvailable: { type: boolean }
 *     responses:
 *       200:
 *         description: Availability updated
 *       400:
 *         description: Invalid slots
 *       404:
 *         description: Availability not found
 */
availabilityRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    const { slots, price } = req.body;
    if (slots !== undefined) {
      if (!Array.isArray(slots)) {
        return res.status(400).json({ message: 'slots must be an array' });
      }
      availability.slots = slots;
    }
    if (price !== undefined) availability.price = price;
    const updated = await availability.save();
    console.log(
      `[availability] Updated ${updated.date.toISOString().split('T')[0]} — €${updated.price}`
    );
    res.json(updated);
  })
);

/**
 * @swagger
 * /availability/{id}:
 *   delete:
 *     summary: Remove an availability date
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Availability removed
 *       404:
 *         description: Availability not found
 */
availabilityRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }
    await availability.deleteOne();
    console.log(`[availability] Removed ${availability.date.toISOString().split('T')[0]}`);
    res.json({ message: 'Availability removed' });
  })
);

export default availabilityRouter;
