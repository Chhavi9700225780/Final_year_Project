import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";

import productionRoutes from "./routes/productionRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import rawMaterialRoutes from "./routes/rawMaterialRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import dashboardAnalyticsRoutes from "./routes/dashboardAnalyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";


const app = express();


// ======================================================
// CORS
// ======================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);


// ======================================================
// BODY PARSERS
// ======================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);


// ======================================================
// COOKIE PARSER
// ======================================================

app.use(cookieParser());


// ======================================================
// API ROUTES
// ======================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/company",
  companyRoutes
);

app.use(
  "/api/production",
  productionRoutes
);

app.use(
  "/api/inventory",
  inventoryRoutes
);

app.use(
  "/api/raw-materials",
  rawMaterialRoutes
);

app.use(
  "/api/finance",
  financeRoutes
);

app.use(
  "/api/sales",
  salesRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/alerts",
  alertRoutes
);

app.use(
  "/api/dashboard-analytics",
  dashboardAnalyticsRoutes
);

app.use(
  "/api/uploads",
  uploadRoutes
);


// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message:
      "MSME Enterprise Dashboard API is running",
  });
});


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "Global Error:",
      err
    );

    res.status(
      err.status || 500
    ).json({
      message:
        err.message ||
        "Internal server error",
    });
  }
);


export default app;