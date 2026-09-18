import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { reviewsController } from "./reviews.controller";

export const router = Router();

router.post("/", auth(Role.CUSTOMER), reviewsController.addreviews);

export const reviewsRoutes = router;
