import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUserFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All users fetched successfully",
      data: {
        result,
      },
    });
  },
);

const updateUsersStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    const status = req.body.status;

    const result = await adminService.updateUsersStatusInDB(
      userId as string,
      status,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: {
        result,
      },
    });
  },
);

const getAllGears = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllGearsInDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All gears fetched successfully",
      data: {
        result,
      },
    });
  },
);

const getAllRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllRentalsInDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "All rentals fetched successfully",
      data: {
        result,
      },
    });
  },
);

export const adminController = {
  getAllUsers,
  updateUsersStatus,
  getAllGears,
  getAllRentals,
};
