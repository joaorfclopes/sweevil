import express from 'express';
import Stripe from 'stripe';
import { placedOrder } from '../mailing/placedOrder.js';
import { placedOrderAdmin } from '../mailing/placedOrderAdmin.js';
import { sendMail } from '../mailing/sendMail.js';
import Booking from '../models/bookingModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { formatDate } from '../utils.js';
import { sendBookingEmails } from './bookingRoute.js';

const webhookRouter = express.Router();

const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const handleOrderPaid = async (paymentIntent) => {
  const { orderId } = paymentIntent.metadata;
  const order = await Order.findById(orderId);
  if (!order || order.isPaid) return;

  order.isPaid = true;
  order.paidAt = Date.now();
  order.status = 'PAID';
  order.paymentResult = {
    id: paymentIntent.id,
    status: paymentIntent.status,
    update_time: new Date(paymentIntent.created * 1000).toISOString(),
    email_address: paymentIntent.receipt_email || '',
  };

  for (const item of order.orderItems) {
    const field = item.isClothing
      ? `countInStock.${item.size.toLowerCase()}`
      : 'countInStock.stock';
    await Product.findByIdAndUpdate(item.product, { $inc: { [field]: -item.qty } });
  }

  await order.save();
  console.log(`[webhook] Order ${orderId} marked as paid`);

  if (!order.confirmationEmailSent) {
    try {
      const stripe = getStripe();
      let invoicePdfBuffer = null;
      let invoiceNumber = 'invoice';
      if (order.stripeInvoiceId) {
        try {
          await stripe.invoices.pay(order.stripeInvoiceId, { paid_out_of_band: true });
          const paidInvoice = await stripe.invoices.retrieve(order.stripeInvoiceId);
          if (paidInvoice.number) invoiceNumber = paidInvoice.number;
          if (paidInvoice.invoice_pdf) {
            const pdfUrl = new URL(paidInvoice.invoice_pdf);
            if (pdfUrl.protocol !== 'https:' || !pdfUrl.hostname.endsWith('.stripe.com')) {
              throw new Error('Unexpected invoice_pdf origin');
            }
            const pdfRes = await fetch(pdfUrl.toString());
            invoicePdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
          }
        } catch (e) {
          console.error('[webhook] Failed to process invoice:', e.message);
        }
      }
      const from = `${process.env.BRAND_NAME} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
      const invoiceAttachment = invoicePdfBuffer
        ? [
            {
              filename: `${invoiceNumber}.pdf`,
              content: invoicePdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [];
      const orderEmailData = {
        orderId: order._id,
        orderDate: formatDate(order.createdAt.toISOString()),
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems,
        itemsPrice: order.itemsPrice,
        shippingPrice: order.shippingPrice,
        totalPrice: order.totalPrice,
      };
      await sendMail({
        from,
        to: order.shippingAddress.email,
        subject: `You placed a new order at ${process.env.BRAND_NAME}!`,
        html: placedOrder({ order: orderEmailData, hasInvoice: !!invoicePdfBuffer }),
        attachments: invoiceAttachment,
      });
      await sendMail({
        from,
        to: process.env.VITE_SENDER_EMAIL_ADDRESS,
        subject: `Order paid — ${order.shippingAddress.fullName}`,
        html: placedOrderAdmin({ order: orderEmailData }),
        attachments: invoiceAttachment,
      });
      await Order.findByIdAndUpdate(order._id, { confirmationEmailSent: true });
      console.log(`[webhook] Confirmation email sent for order ${orderId}`);
    } catch (e) {
      console.error('[webhook] Failed to send confirmation email:', e.message);
    }
  }
};

const handleBookingPaid = async (paymentIntent) => {
  const { bookingId } = paymentIntent.metadata;
  const booking = await Booking.findById(bookingId);
  if (!booking || booking.isPaid) return;

  booking.isPaid = true;
  booking.paidAt = Date.now();
  booking.status = 'CONFIRMED';
  booking.paymentResult = {
    id: paymentIntent.id,
    status: paymentIntent.status,
    update_time: new Date(paymentIntent.created * 1000).toISOString(),
  };

  const updated = await booking.save();
  console.log(`[webhook] Booking ${bookingId} marked as confirmed`);

  if (!booking.confirmationEmailSent) {
    try {
      const stripe = getStripe();
      let invoicePdfBuffer = null;
      let invoiceNumber = 'invoice';
      if (booking.stripeInvoiceId) {
        try {
          await stripe.invoices.pay(booking.stripeInvoiceId, { paid_out_of_band: true });
          const paidInvoice = await stripe.invoices.retrieve(booking.stripeInvoiceId);
          if (paidInvoice.number) invoiceNumber = paidInvoice.number;
          if (paidInvoice.invoice_pdf) {
            const pdfUrl = new URL(paidInvoice.invoice_pdf);
            if (pdfUrl.protocol !== 'https:' || !pdfUrl.hostname.endsWith('.stripe.com')) {
              throw new Error('Unexpected invoice_pdf origin');
            }
            const pdfRes = await fetch(pdfUrl.toString());
            invoicePdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
          }
        } catch (e) {
          console.error('[webhook] Failed to process booking invoice:', e.message);
        }
      }
      await sendBookingEmails(updated, invoicePdfBuffer, invoiceNumber);
      await Booking.findByIdAndUpdate(booking._id, { confirmationEmailSent: true });
      console.log(`[webhook] Confirmation email sent for booking ${bookingId}`);
    } catch (e) {
      console.error('[webhook] Failed to send booking confirmation email:', e.message);
    }
  }
};

const handlePaymentFailed = async (paymentIntent) => {
  const brand = process.env.BRAND_NAME || 'Sweevil';
  const from = `${brand} <${process.env.VITE_SENDER_EMAIL_ADDRESS}>`;
  const adminEmail = process.env.VITE_SENDER_EMAIL_ADDRESS;
  const reason = paymentIntent.last_payment_error?.message || 'Unknown reason';

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

webhookRouter.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = getStripe().webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    try {
      if (pi.metadata?.orderId) {
        await handleOrderPaid(pi);
      } else if (pi.metadata?.bookingId) {
        await handleBookingPaid(pi);
      }
    } catch (err) {
      console.error('[webhook] Handler error:', err.message);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    try {
      await handlePaymentFailed(pi);
    } catch (err) {
      console.error('[webhook] Payment failed handler error:', err.message);
    }
  }

  res.json({ received: true });
});

export default webhookRouter;
