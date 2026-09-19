import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { providersController } from "./providers.controller";

export const router = Router();

router.post("/gear", auth(Role.PROVIDER), providersController.addGear);
router.put(
  "/gear/:gearId",
  auth(Role.PROVIDER, Role.ADMIN),
  providersController.updateGear,
);
router.patch(
  "/gear/:gearId",
  auth(Role.PROVIDER, Role.ADMIN),
  providersController.deleteGear,
);

router.get("/gears", providersController.getAllGearsFilter);
// router.get("/gear", providersController.getGearById);

export const providersRoutes = router;
