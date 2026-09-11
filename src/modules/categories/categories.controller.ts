import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { categoriesService } from "./categories.service";

const addcategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await categoriesService.addCategoriesInDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Add categories successfully",
      data: {
        result,
      },
    });
  },
);

const updateCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoriesId = req.params.categoriesId;

    if (!categoriesId) {
      throw new Error("Categories Id Required In Params");
    }

    const payload = req.body;

    const result = await categoriesService.updateCategoriesInDB(
      categoriesId as string,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories updated successfully",
      data: {
        result,
      },
    });
  },
);

const deleteCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoriesId = req.params.categoriesId;

    if (!categoriesId) {
      throw new Error("Gear Id Required In Params");
    }

    await categoriesService.deleteCategoriesInDB(categoriesId as string);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories deleted successfully",
    });
  },
);

export const categoriesController = {
  addcategories,
  updateCategories,
  deleteCategories,
};
