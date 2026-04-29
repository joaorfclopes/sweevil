import express from "express";
import Stripe from "stripe";
import Order from "../models/orderModel.js";
import Booking from "../models/bookingModel.js";
import Product from "../models/productModel.js";
import { sendBookingEmails } from "./bookingRoute.js";

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
    const product = await Product.findById(item.product);
    if (product) {
      if (!product.isClothing) {
        product.countInStock.stock -= item.qty;
      } else {
        if (item.size === "XS") product.countInStock.xs -= item.qty;
        else if (item.size === "S") product.countInStock.s -= item.qty;
        else if (item.size === "M") product.countInStock.m -= item.qty;
        else if (item.size === "L") product.countInStock.l -= item.qty;
        else if (item.size === "XL") product.countInStock.xl -= item.qty;
        else if (item.size === "XXL") product.countInStock.xxl -= item.qty;
      }
      await product.save();
    }
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
  sendBookingEmails(updated);
  console.log(`[webhook] Booking ${bookingId} marked as confirmed`);
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
    return res.status(400).send(`Webhook Error: ${err.message}`);
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

  res.json({ received: true });
});

export default webhookRouter;
