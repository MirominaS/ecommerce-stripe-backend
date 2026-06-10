import express from "express";
import cors from "cors"
import paymentRoutes from "./routes/paymentRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import authRoutes from "./routes/authRoutes.js"
import orderRoutes from "./routes/orderRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js"
import emailRoutes from './routes/emailRoutes.js'
import mediaRoutes from './routes/mediaRoutes.js'

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes)

//payment
app.use("/api/payments",paymentRoutes)

//products
app.use("/api/products",productRoutes)

//order
app.use("/api/orders", orderRoutes);

//dashboard
app.use("/api/admin", adminDashboardRoutes)

app.use('/api/email', emailRoutes);

app.use("/api/media",mediaRoutes)

app.get("/", (req,res) => {
    res.send("Server is running")
})

export default app;