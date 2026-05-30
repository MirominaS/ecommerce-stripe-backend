import stripe from "../config/stripe.js";

export const createCheckoutSession = async (product) => {

    const session = await stripe.checkout.sessions.create({

        ui_mode: "embedded_page",

        line_items: [
          {
            price_data: {
              currency: product.currency,

              product_data: {
                name: product.name,
              },

              unit_amount:
                product.price * 100,
            },

            quantity: 1,
          },
        ],

        mode: "payment",

        return_url:"http://localhost:5173/success",
      });

    return session;
};