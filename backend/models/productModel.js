import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true },
    images: [{ type: String }],
    category: { type: String },
    description: { type: String },
    price: { type: Number },
    isClothing: { type: Boolean },
    countInStock: {
      stock: { type: Number },
      xs: { type: Number },
      s: { type: Number },
      m: { type: Number },
      l: { type: Number },
      xl: { type: Number },
      xxl: { type: Number },
    },
    taxPrice: { type: Number },
    finalPrice: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
