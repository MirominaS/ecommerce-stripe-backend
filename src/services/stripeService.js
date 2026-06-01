import stripe from "../config/stripe.js";
// import Cart from "../models/Cart.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";
import { createOrderService } from "./orderService.js";
import Product from "../models/Product.js";

export const createCheckoutSessionService = async (user, items) => {
   if(!items || items.length === 0) {
    throw new Error("Cart is empty")
   }

    //convert cart items to stripe line items
    const line_items = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.title,
        },
        unit_amount: item.price*100,
      },
      quantity: item.quantity,
    }))

    //calculate total amount
    const totalAmount = items.reduce(
      (total, item) => total + item.price*item.quantity,0
    )
    //create stripe session
    const session = await stripe.checkout.sessions.create({

        ui_mode: "embedded_page",
        line_items,
        mode: "payment",

        return_url:"http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
      });

      //save payment
      await Payment.create({
        user: user._id,
        sessionId: session.id,
        amount: totalAmount,
        paymentStatus: "pending",
        customerEmail: user.email,
      })

    return session;
};

export const paymentSuccessService = async (sessionId, userId) => {
  //verify stripe session
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  //verify payment success
  if(session.payment_status !== "paid") {
    throw new Error("Payment not completed")
  }

  //update payment document
  await Payment.findOneAndUpdate(
    {sessionId},
    {paymentStatus : "paid"},
  )

    return session;
  
}

export const createBuyNowCheckoutService = async(productId, user) => {
  const product = await Product.findById(productId);

  if(!product) {
    throw new Error("Product not found");
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded_page",
    metadata: {
      productId: product._id.toString(),
      quantity: "1",
      isBuyNow: "true",
  },
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.title,
          },
          unit_amount: product.price * 100,
        },
        quantity: 1,
      }
    ],
    mode: "payment",
    return_url: "http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}",
  });

  await Payment.create({
    user: user._id,
    sessionId: session.id,
    amount: product.price,
    paymentStatus: "pending",
    customerEmail: user.email,
  })

  return session;
}