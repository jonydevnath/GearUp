import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../generated/prisma/client";

export const globalErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error("Unhandled application error:", err);

  let statusCode: number =
    err.statusCode ||
    (err instanceof Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR);
  let errorMessage =
    statusCode >= httpStatus.INTERNAL_SERVER_ERROR
      ? "Internal Server Error"
      : err.message || "Request failed";
  let errorName =
    statusCode >= httpStatus.INTERNAL_SERVER_ERROR
      ? "Internal Server Error"
      : err.name || "RequestError";

  if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    errorMessage = "You have provided incorrect field type or missing fields";
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Duplicate Key Error";
    } else if (err.code === "P2003") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Foreign key constraint failed";
    } else if (err.code === "P2025") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage =
        "An operation failed because it depends on one or more records that were required but not found.";
    }
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = httpStatus.UNAUTHORIZED;
      errorMessage =
        "Authentication failed against database server. Please check your credentials";
    } else if (err.errorCode === "P1001") {
      statusCode = httpStatus.BAD_REQUEST;
      errorMessage = "Can't reach database server";
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    errorName = "Internal Server Error";
    errorMessage = "Error occurred during query execution";
  }

  if (statusCode >= httpStatus.INTERNAL_SERVER_ERROR) {
    errorName = "Internal Server Error";
    errorMessage = "Internal Server Error";
  } else if (statusCode === httpStatus.BAD_REQUEST) {
    errorName = "Bad Request";
  } else if (statusCode === httpStatus.UNAUTHORIZED) {
    errorName = "Unauthorized";
  } else if (statusCode === httpStatus.FORBIDDEN) {
    errorName = "Forbidden";
  } else if (statusCode === httpStatus.CONFLICT) {
    errorName = "Conflict";
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    name: errorName,
    message: errorMessage,
  });
};
