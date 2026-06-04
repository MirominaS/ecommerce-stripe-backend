import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    customerEmail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ createdAt: -1, paymentStatus: 1 });
const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
