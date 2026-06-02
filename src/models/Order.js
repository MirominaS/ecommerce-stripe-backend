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
        
        title: {
          type: String,
          required: true,
        },
        
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
    
    paymentSessionId: {
      type: String,
      required: true,
      unique: true,
    },
    
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    
    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered"],
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

const Order = mongoose.model("Order", orderSchema);

export default Order;
