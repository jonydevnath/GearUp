import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { categoriesController } from "./categories.controller";

const router = Router();

router.post("/", auth(Role.ADMIN), categoriesController.addcategories);
router.put(
  "/:categoriesId",
  auth(Role.ADMIN),
  categoriesController.updateCategories,
);
router.delete(
  "/:categoriesId",
  auth(Role.ADMIN),
  categoriesController.deleteCategories,
);

export const categoriesRoutes = router;
