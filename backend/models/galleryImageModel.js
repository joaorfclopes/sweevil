import mongoose from "mongoose";

const galleryImageSchema = new mongoose.Schema(
  {
    image: { type: String },
  },
  {
    timestamps: true,
  }
);

const GalleryImage = mongoose.model("Gallery", galleryImageSchema);

export default GalleryImage;
