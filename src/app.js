import express from "express";
import cors from "cors"
import paymentRoutes from "./routes/paymentRoutes.js"

const app = express();

app.use(cors());

app.use(express.json());

//payment
app.use("/api/payments",paymentRoutes)

app.get("/", (req,res) => {
    res.send("Server is running")
})

export default app;