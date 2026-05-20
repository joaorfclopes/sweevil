import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        size: { type: String },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],
    shippingAddress: {
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    stripeInvoiceId: { type: String },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      invoiceId: String,
    },
    itemsQty: { type: Number, required: true },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    confirmationEmailSent: { type: Boolean, default: false },
    paidAt: { type: Date },
    isSent: { type: Boolean, default: false },
    sentAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    isRefunded: { type: Boolean, default: false },
    status: { type: String, required: true },
    confirmToken: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({ confirmToken: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ isPaid: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
