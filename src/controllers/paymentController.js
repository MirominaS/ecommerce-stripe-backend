import products from "../data/products.js"
import { createCheckoutSession } from "../services/stripeService.js";
import Payment from '../models/Payment.js'

export const checkout = async (req, res ) => {
    try {
        const {productId} = req.body 

        //find product
        const product = products.find(
            (item) => item.id === Number(productId)
        );

        //validate product
        if(!product) {
            return res.status(404).json({
                message: "Product not found",
            })
        }
        const session = await createCheckoutSession(product)

        //save payment in db
        await Payment.create({
            sessionId: session.id,
            amount: product.price,
            paymentStatus: "Pending",
        })

        //send checkout url
        res.status(200).json({
           clientSecret: session.client_secret,
        }) 
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Checkout session failed"
        })
    }
}