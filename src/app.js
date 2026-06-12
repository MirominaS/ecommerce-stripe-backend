import express from "express";
import cors from "cors";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import folderRoutes from "./routes/folderRoutes.js";
import productVariantRoutes from "./routes/productVariantRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/auth", authRoutes);

//payment
app.use("/api/payments", paymentRoutes);

//products
app.use("/api/products", productRoutes);
app.use("/api/variants", productVariantRoutes);
app.use("/api/purchases", purchaseRoutes);

//order
app.use("/api/orders", orderRoutes);

//dashboard
app.use("/api/admin", adminDashboardRoutes);

app.use("/api/email", emailRoutes);

app.use("/api/media", mediaRoutes);

app.use("/api/folders", folderRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

export default app;
