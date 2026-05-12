import express from "express";
import Stripe from "stripe";
import Order from "../models/orderModel.js";
import Booking from "../models/bookingModel.js";
import Product from "../models/productModel.js";
import { sendBookingEmails } from "./bookingRoute.js";
import { sendMail } from "../mailing/sendMail.js";

const webhookRouter = express.Router();

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const handleOrderPaid = async (paymentIntent) => {
  const { orderId } = paymentIntent.metadata;
  const order = await Order.findById(orderId);
  if (!order || order.isPaid) return;

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = "PAID";
  order.paymentResult = {
    id: paymentIntent.id,
    status: paymentIntent.status,
    update_time: new Date(paymentIntent.created * 1000).toISOString(),
    email_address: paymentIntent.receipt_email || "",
  };

  for (const item of order.orderItems) {
    const field = item.isClothing
      ? `countInStock.${item.size.toLowerCase()}`
      : "countInStock.stock";
    await Product.findByIdAndUpdate(item.product, { $inc: { [field]: -item.qty } });
  }

  await order.save();
  console.log(`[webhook] Order ${orderId} marked as paid`);
};

const handleBookingPaid = async (paymentIntent) => {
  const { bookingId } = paymentIntent.metadata;
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.isPaid) return;

  booking.isPaid = true;
  booking.paidAt = Date.now();
  booking.status = "CONFIRMED";
  booking.paymentResult = {
    id: paymentIntent.id,
    status: paymentIntent.status,
    update_time: new Date(paymentIntent.created * 1000).toISOString(),
  };

  const updated = await booking.save();
  await sendBookingEmails(updated);
  console.log(`[webhook] Booking ${bookingId} marked as confirmed`);
};

const handlePaymentFailed = async (paymentIntent) => {
  const brand = process.env.BRAND_NAME || "Sweevil";
  const from = `${brand} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
  const adminEmail = process.env.VITE_SENDER_EMAIL_ADDRESS;
  const reason = paymentIntent.last_payment_error?.message || "Unknown reason";

  let subject, body;
  if (paymentIntent.metadata?.orderId) {
    const order = await Order.findById(paymentIntent.metadata.orderId);
    const name = order?.shippingAddress?.fullName || paymentIntent.metadata.orderId;
    subject = `Payment failed — Order by ${name}`;
    body = `<p>Payment failed for order by <strong>${name}</strong>.</p><p>Order ID: ${paymentIntent.metadata.orderId}</p><p>Reason: ${reason}</p>`;
  } else if (paymentIntent.metadata?.bookingId) {
    const booking = await Booking.findById(paymentIntent.metadata.bookingId);
    const name = booking?.guestInfo?.name || paymentIntent.metadata.bookingId;
    subject = `Payment failed — Booking by ${name}`;
    body = `<p>Payment failed for booking by <strong>${name}</strong>.</p><p>Booking ID: ${paymentIntent.metadata.bookingId}</p><p>Reason: ${reason}</p>`;
  } else {
    return;
  }

  await sendMail({
    from,
    to: adminEmail,
    subject,
    html: `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;color:#1a1a1a;padding:24px;">${body}<p style="color:#999;font-size:12px;margin-top:32px;">&copy; ${new Date().getFullYear()} ${brand}</p></body></html>`,
  });
  console.log(`[webhook] Payment failed notification sent: ${subject}`);
};

webhookRouter.post("/stripe", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    try {
      if (pi.metadata?.orderId) {
        await handleOrderPaid(pi);
      } else if (pi.metadata?.bookingId) {
        await handleBookingPaid(pi);
      }
    } catch (err) {
      console.error("[webhook] Handler error:", err.message);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    try {
      await handlePaymentFailed(pi);
    } catch (err) {
      console.error("[webhook] Payment failed handler error:", err.message);
    }
  }

  res.json({ received: true });
});

export default webhookRouter;
