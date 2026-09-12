import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { providersService } from "./providers.service";
import { Role } from "../../../generated/prisma/enums";

const addGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const payload = req.body;

    const result = await providersService.addGearInDB(payload, providerId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Add gear to inventory successfully",
      data: {
        result,
      },
    });
  },
);

const updateGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const gearId = req.params.gearId;

    if (!gearId) {
      throw new Error("Gear Id Required In Params");
    }

    const payload = req.body;

    const result = await providersService.updateGearInDB(
      gearId as string,
      payload,
      user as { id: string; role: Role },
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear updated successfully",
      data: {
        result,
      },
    });
  },
);

const deleteGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const gearId = req.params.gearId;

    if (!gearId) {
      throw new Error("Gear Id Required In Params");
    }

    await providersService.deleteGearInDB(
      gearId as string,
      user as { id: string; role: Role },
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear deleted successfully",
    });
  },
);

export const providersController = {
  addGear,
  updateGear,
  deleteGear,
};
