import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { providerService } from "./provider.service";

const addGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.user?.id;
    const payload = req.body;

    const result = await providerService.addGearInDB(payload, id as string);

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
    const providerId = req.user?.id;
    const gearId = req.params.gearId;

    if (!gearId) {
      throw new Error("Gear Id Required In Params");
    }

    const payload = req.body;

    const result = await providerService.updateGearInDB(
      gearId as string,
      payload,
      providerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear Updated successfully",
      data: {
        result,
      },
    });
  },
);

const deleteGear = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id;
    const gearId = req.params.gearId;

    if (!gearId) {
      throw new Error("Gear Id Required In Params");
    }

    await providerService.deleteGearInDB(
      gearId as string,
      providerId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Gear Deleted successfully",
    });
  },
);

export const providerController = {
  addGear,
  updateGear,
  deleteGear,
};
