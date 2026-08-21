import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import rawMaterialRoutes from "./routes/rawMaterialRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

const app = express();

app.use(cors());

app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MSME Enterprise Data Integration API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/companies", companyRoutes);

app.use("/api/production", productionRoutes);

app.use("/api/inventory", inventoryRoutes);

app.use("/api/raw-materials", rawMaterialRoutes);

app.use("/api/finance", financeRoutes);

app.use("/api/sales", salesRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/alerts", alertRoutes);

app.use(
  "/api/uploads",
  uploadRoutes
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;