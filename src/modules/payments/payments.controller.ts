import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentsService } from "./payments.service";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { rentalOrderId } = req.body;
    const userId = req.user?.id;

    const result = await paymentsService.createCheckoutSessionInDB(
      rentalOrderId,
      userId as string,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Stripe checkout session created successfully",
      data: result,
    });
  },
);

export const paymentsController = {
  createCheckoutSession,
};
