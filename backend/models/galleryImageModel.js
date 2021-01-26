import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    year: { type: Number, required: true },
    image: { type: String, required: true, unique: true },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const GalleryImage = mongoose.model("Gallery", galleryImageSchema);

export default GalleryImage;
