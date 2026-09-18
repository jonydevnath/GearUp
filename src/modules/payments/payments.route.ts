import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentsController } from "./payments.controller";

const router = Router();

router.post(
  "/create-checkout-session",
  auth(Role.CUSTOMER),
  paymentsController.createCheckoutSession,
);

router.post("/webhook", paymentsController.handleWebhook);


export const paymentsRoutes = router;
