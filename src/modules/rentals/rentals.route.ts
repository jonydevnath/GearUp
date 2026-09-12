import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { ordersController } from "./rentals.controller";

export const router = Router();

router.post("/", auth(Role.CUSTOMER), ordersController.addRentals);
// router.patch("/:rentalId", auth(Role.CUSTOMER), ordersController.updateOrders);
// router.patch("/:rentalId", auth(Role.CUSTOMER), ordersController.deleteOrders);


export const ordersRoutes = router;
