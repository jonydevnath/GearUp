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

export const providerController = {
  addGear,
};
