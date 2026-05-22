import mongoose from 'mongoose';

const galleryImageSchema = new mongoose.Schema(
  {
    description: { type: String },
    descriptionEn: { type: String },
    descriptionPt: { type: String },
    useDescriptionTranslation: { type: Boolean, default: false },
    image: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    order: { type: Number, default: 0 },
    width: { type: Number },
    height: { type: Number },
  },
  {
    timestamps: true,
  }
);

const GalleryImage = mongoose.model('Gallery', galleryImageSchema);

export default GalleryImage;
