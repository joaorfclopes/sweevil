import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    image: { type: String, unique: true },
  },
  {
    timestamps: true,
  }
);

const GalleryImage = mongoose.model("Gallery", galleryImageSchema);

export default GalleryImage;
