import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    image: { type: String, required: true, unique: true },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const GalleryImage = mongoose.model("Gallery", galleryImageSchema);

export default GalleryImage;
