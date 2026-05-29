import stripe from "../config/stripe.js";

export const createCheckoutSession = async (product) => {
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: product.currency,
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: product.price,
                },
                quantity: 1
            },
        ],
        mode: "payment",
        success_url: "http://localhost:5173/success",
        cancel_url: "http://localhost:5173/cancel"
    })
    return session
}