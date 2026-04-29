import express from "express";
import expressAsyncHandler from "express-async-handler";
import nodemailer from "nodemailer";
import Stripe from "stripe";
import Booking from "../models/bookingModel.js";
import Availability from "../models/availabilityModel.js";
import { isAdmin, isAuth } from "../utils.js";
import { bookingConfirmation } from "../mailing/bookingConfirmation.js";
import { bookingAdmin } from "../mailing/bookingAdmin.js";
import { generateICS } from "../mailing/calendarInvite.js";

const bookingRouter = express.Router();

let _stripe;
const getStripe = () => {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
};

let _etherealAccount = null;
const getTransporter = async () => {
  if (process.env.MAILING_SERVICE_CLIENT_ID) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.VITE_SENDER_EMAIL_ADDRESS,
        clientId: process.env.MAILING_SERVICE_CLIENT_ID,
        clientSecret: process.env.MAILING_SERVICE_CLIENT_SECRET,
        refreshToken: process.env.MAILING_SERVICE_REFRESH_TOKEN,
        accessToken: process.env.MAILING_SERVICE_ACCESS_TOKEN,
      },
    });
  }
  if (!_etherealAccount) {
    _etherealAccount = await nodemailer.createTestAccount();
    console.log(`[booking email] Ethereal test account: ${_etherealAccount.user}`);
    console.log("[booking email] View sent emails at: https://ethereal.email/messages");
  }
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: _etherealAccount.user, pass: _etherealAccount.pass },
  });
};

const sendMail = async (mailOptions) => {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[booking email] Preview: ${previewUrl}`);
  } catch (err) {
    console.error("[booking email] ERROR:", err.message);
  }
};

bookingRouter.get(
  "/",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const bookings = await Booking.find({}).sort({ date: -1 });
    res.json(bookings);
  })
);

bookingRouter.post(
  "/",
  expressAsyncHandler(async (req, res) => {
    const { date, slot, guestInfo, images } = req.body;
    if (!date || !slot || !guestInfo?.name || !guestInfo?.email || !guestInfo?.phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const avail = await Availability.findOne({ date: new Date(date) });
    if (!avail) {
      return res.status(400).json({ message: "No availability for this date" });
    }
    const slotInfo = avail.slots.find((s) => s.time === slot && s.isAvailable);
    if (!slotInfo) {
      return res.status(400).json({ message: "Slot not available" });
    }
    const existing = await Booking.findOne({
      date: new Date(date),
      slot,
      status: "CONFIRMED",
    });
    if (existing) {
      return res.status(409).json({ message: "This slot is already booked" });
    }
    const safeImages = Array.isArray(images) ? images.slice(0, 10) : [];
    const booking = new Booking({ date: new Date(date), slot, price: avail.price, guestInfo, images: safeImages });
    const created = await booking.save();
    res.status(201).json(created);
  })
);

bookingRouter.post(
  "/:id/create-payment-intent",
  expressAsyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.isPaid) return res.status(400).json({ message: "Already paid" });
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(booking.price * 100),
      currency: "eur",
      automatic_payment_methods: { enabled: true, allow_redirects: "never" },
      metadata: { bookingId: booking._id.toString() },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  })
);

bookingRouter.put(
  "/:id/pay",
  expressAsyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const { paymentIntentId } = req.body;
    if (!paymentIntentId) {
      return res.status(400).json({ message: "paymentIntentId is required" });
    }

    const conflict = await Booking.findOne({
      date: booking.date,
      slot: booking.slot,
      status: "CONFIRMED",
      _id: { $ne: booking._id },
    });
    if (conflict) {
      return res.status(409).json({ message: "Slot was just taken by someone else" });
    }

    const paymentIntent = await getStripe().paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded") {
      return res.status(402).json({ message: `Payment not succeeded: ${paymentIntent.status}` });
    }
    if (Math.abs(paymentIntent.amount_received - Math.round(booking.price * 100)) > 1) {
      return res.status(402).json({ message: "Amount mismatch" });
    }

    booking.isPaid = true;
    booking.paidAt = Date.now();
    booking.status = "CONFIRMED";
    booking.paymentResult = {
      id: paymentIntent.id,
      status: paymentIntent.status,
      update_time: new Date(paymentIntent.created * 1000).toISOString(),
    };
    const updated = await booking.save();

    const from = `${process.env.BRAND_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
    const adminEmail = process.env.VITE_SENDER_EMAIL_ADDRESS;
    const icsContent = generateICS({ booking: updated, adminEmail });
    const icsAttachment = {
      filename: "booking.ics",
      content: icsContent,
      contentType: "text/calendar; charset=utf-8; method=REQUEST",
    };
    sendMail({
      from,
      to: booking.guestInfo.email,
      subject: `Booking confirmed — ${booking.slot} on ${booking.date.toLocaleDateString("pt-PT")}`,
      html: bookingConfirmation({ booking: updated }),
      attachments: [icsAttachment],
    });
    sendMail({
      from,
      to: adminEmail,
      subject: `New booking — ${booking.guestInfo.name}`,
      html: bookingAdmin({ booking: updated }),
      attachments: [icsAttachment],
    });

    res.json({ message: "Booking confirmed", booking: updated });
  })
);

bookingRouter.put(
  "/:id/cancel",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    booking.status = "CANCELED";
    const updated = await booking.save();
    res.json({ message: "Booking canceled", booking: updated });
  })
);

bookingRouter.delete(
  "/:id",
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    await booking.deleteOne();
    res.json({ message: "Booking deleted" });
  })
);

export default bookingRouter;
