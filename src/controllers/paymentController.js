import {
  createCheckoutSessionService,
  paymentSuccessService,
  createBuyNowCheckoutService,
} from "../services/stripeService.js";
import Payment from "../models/Payment.js";
import { createOrderService } from "../services/orderService.js";
import Product from "../models/Product.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body;
    const session = await createCheckoutSessionService(req.user, items);

    //send checkout url
    res.status(200).json({
      success: true,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Checkout session failed",
    });
  }
};

export const paymentSuccess = async (req, res) => {
  try {
    console.log(req.body);
    const { sessionId, items } = req.body;

    const session = await paymentSuccessService(sessionId);

    let order;

    if (items && items.length > 0) {
      order = await createOrderService(req.user._id, items);
    } else if (session.metadata.isBuyNow === "true") {
      const product = await Product.findById(session.metadata.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const buyNowItems = [
        {
          _id: product._id,
          title: product.title,
          price: product.price,
          image: product.image,
          quantity: Number(session.metadata.quantity),
        },
      ];
      order = await createOrderService(req.user._id, buyNowItems);
    }

    //create payment
    const payment = await Payment.findOne({
        sessionId,
    })

    if(!payment) {
        throw new Error ("Payment not found")
    }

    payment.paymentStatus = "paid"
    payment.order = order._id;
    await payment.save()

    order.payment = payment._id;
    await order.save();

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createBuyNowCheckout = async (req, res) => {
  try {
    const session = await createBuyNowCheckoutService(
      req.params.productId,
      req.user,
    );

    res.status(200).json({
      success: true,
      clientSecret: session.client_secret,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
