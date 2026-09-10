import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { providerController } from "./provider.controller";

const router = Router();

router.post("/gear", auth(Role.PROVIDER), providerController.addGear);
router.put("/gear/:gearId", auth(Role.PROVIDER), providerController.updateGear);
router.delete("/gear/:gearId", auth(Role.PROVIDER), providerController.deleteGear);

export const providerRoutes = router;
