import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { adminController } from "./admin.controller";

const router = Router();

router.get("/users", auth(Role.ADMIN), adminController.getAllUsers);
router.patch("/users/:userId", auth(Role.ADMIN), adminController.updateUsersStatus);
router.get("/gears", auth(Role.ADMIN), adminController.getAllGears);
router.get("/rentals", auth(Role.ADMIN), adminController.getAllRentals);


export const adminRoutes = router;
