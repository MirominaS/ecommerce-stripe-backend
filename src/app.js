import express from "express";
import cors from "cors"
import stripe from "./config/stripe.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", async(req,res) => {
     const balance = await stripe.balance.retrieve();

  res.json(balance);
})

export default app;