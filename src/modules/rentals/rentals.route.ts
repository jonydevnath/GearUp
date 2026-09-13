import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { ordersController } from "./rentals.controller";

export const router = Router();

router.post("/", auth(Role.CUSTOMER), ordersController.addRentals);
router.patch("/:rentalId/status", auth(Role.PROVIDER, Role.ADMIN), ordersController.updateRentalStatus);
// router.get("/", auth(Role.CUSTOMER, Role.PROVIDER), ordersController.getUserOrders);

export const ordersRoutes = router;
