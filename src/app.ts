import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { authRoutes } from "./modules/auth/auth.route";
import { providersRoutes } from "./modules/providers/providers.route";
import { categoriesRoutes } from "./modules/categories/categories.route";
import { ordersRoutes } from "./modules/rentals/rentals.route";
import { adminRoutes } from "./modules/admin/admin.route";
import { paymentsRoutes } from "./modules/payments/payments.route";

const app: Application = express();

// buildin middleware
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// Stripe webhooks require the raw request body for signature verification
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

app.use("/api/auth", authRoutes);
app.use("/api/providers", providersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/rentals", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentsRoutes);

export default app;
