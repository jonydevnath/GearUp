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

router.post(
  "/confirm",
  auth(Role.CUSTOMER),
  paymentsController.confirmCheckoutSession,
);

router.post("/webhook", paymentsController.handleWebhook);

router.get(
  "/",
  auth(Role.CUSTOMER, Role.ADMIN),
  paymentsController.getPayments,
);

router.get(
  "/:rentalOrderId",
  auth(),
  paymentsController.getPaymentByRentalOrderId,
);

export const paymentsRoutes = router;
