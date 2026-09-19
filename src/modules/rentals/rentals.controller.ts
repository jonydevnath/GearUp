import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { rentalsService } from "./rentals.service";

const addRentals = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const payload = req.body;

    const result = await rentalsService.addRentalsInDB(
      customerId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Add rentals successfully",
      data: {
        result,
      },
    });
  },
);

const getCustomerRentals = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const result = await rentalsService.getCustomerRentalsFromDB(
      req.user!.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Customer rental orders retrieved successfully",
      data: result,
    });
  },
);

const getCustomerRentalById = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const rentalId = req.params.rentalId as string;

    if (!rentalId) {
      throw new Error("Rental ID is required in params");
    }

    const result = await rentalsService.getCustomerRentalByIdFromDB(
      rentalId, 
      req.user!.id,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Customer rental order retrieved successfully",
      data: result,
    });
  },
);

export const updateRentalStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalId } = req.params;
    const { status } = req.body;
    const user = req.user; 

    if (!rentalId) {
      throw new Error("Rental ID is required in params");
    }

    const result = await rentalsService.updateRentalStatusInDB(
      rentalId as string,
      status,
      user as { id: string; role: string }
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: `Rental order status updated to ${status} successfully`,
      data: result,
    });
  }
);

export const ordersController = {
  addRentals,
  getCustomerRentals,
  getCustomerRentalById,
  updateRentalStatus,
};
