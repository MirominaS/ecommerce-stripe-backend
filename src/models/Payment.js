import mongoose from "mongoose";

const paymentSchema =  new mongoose.Schema(
    {
        sessionId: {
            type: String,
            required: true,
        },

        amount: {
            type: Number,
            required: true,
        },

        paymentStatus: {
            type: String,
            default: "",
        },

        customerEmail: {
            type: String,
            default: ""
        },
    }, {
        timestamps: true,
    }
)

const Payment = mongoose.model("Payment",paymentSchema)

export default Payment;