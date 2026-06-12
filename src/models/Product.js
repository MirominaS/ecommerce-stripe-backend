import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Media",
      // required: true,
    },

    category: {
      type: String,
      required: true,
    },

    hasVariants: {
      type: Boolean,
      default: false,
    },

    sku: {
      type: String,
      trim: true,
    },

    sellingPrice: {
      type: Number,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
