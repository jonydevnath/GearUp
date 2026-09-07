import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
// import { authRoutes } from "./modules/auth/auth.route";

const app: Application = express();

// buildin middleware
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// passing the raw middleware before the json() middleware
app.use("/api/subscription/webhook", express.raw({ type: "application/json" }))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("hello world");
});

// app.use("/api/auth", authRoutes);

export default app;
