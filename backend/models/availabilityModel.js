import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true, unique: true },
    slots: [slotSchema],
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

const Availability = mongoose.model("Availability", availabilitySchema);
export default Availability;
