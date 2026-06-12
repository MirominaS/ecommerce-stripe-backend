import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ProductVariant",
          default: null,
        },

        title: {
          type: String,
          required: true,
        },

        sku: String,

        price: {
          type: Number,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    totalPrice: {
      type: Number,
      required: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "processing",
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

orderSchema.index({ createdAt: -1 });
orderSchema.index({ createdAt: -1, orderStatus: 1 });
const Order = mongoose.model("Order", orderSchema);

export default Order;
