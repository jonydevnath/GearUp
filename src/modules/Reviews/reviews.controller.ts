import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { reviewsService } from "./reviews.service";

const addreviews = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id;
    const payload = req.body;

    const result = await reviewsService.addReviewsInDB(
      customerId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Add review successfully",
      data: {
        result,
      },
    });
  },
);

export const reviewsController = {
    addreviews,
}