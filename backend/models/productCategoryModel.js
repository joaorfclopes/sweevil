import mongoose from 'mongoose';

const productCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    nameEn: { type: String, trim: true },
    namePt: { type: String, trim: true },
    isClothing: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ProductCategory = mongoose.model('ProductCategory', productCategorySchema);

export default ProductCategory;
