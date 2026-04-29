import express from "express";
import expressAsyncHandler from "express-async-handler";
import Availability from "../models/availabilityModel.js";
import Booking from "../models/bookingModel.js";
import { isAdmin, isAuth } from "../utils.js";

const availabilityRouter = express.Router();

availabilityRouter.get(
  "/",
  expressAsyncHandler(async (req, res) => {
    const availability = await Availability.find({}).sort({ date: 1 });
    const result = await Promise.all(
      availability.map(async (avail) => {
        const bookings = await Booking.find({
          date: avail.date,
          status: "CONFIRMED",
        });
        const bookedSlots = bookings.map((b) => b.slot);
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
      })
    );
    res.json(result);
  })
);

availabilityRouter.post(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { date, slots, price } = req.body;
    const existing = await Availability.findOne({ date: new Date(date) });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Availability already exists for this date" });
    }
    const availability = new Availability({
      date: new Date(date),
      slots,
      price,
    });
    const created = await availability.save();
    res.status(201).json(created);
  })
);

availabilityRouter.put(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    const { slots, price } = req.body;
    if (slots !== undefined) availability.slots = slots;
    if (price !== undefined) availability.price = price;
    const updated = await availability.save();
    res.json(updated);
  })
);

availabilityRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const availability = await Availability.findById(req.params.id);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }
    await availability.deleteOne();
    res.json({ message: "Availability removed" });
  })
);

export default availabilityRouter;
