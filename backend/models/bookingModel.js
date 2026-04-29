import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    slot: { type: String, required: true },
    price: { type: Number, required: true },
    guestInfo: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      notes: { type: String, default: "" },
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["PENDING_PAYMENT", "CONFIRMED", "CANCELED"],
      default: "PENDING_PAYMENT",
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
    },
    images: [{ type: String }],
    confirmToken: { type: String },
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
