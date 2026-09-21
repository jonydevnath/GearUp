import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Role } from "../../generated/prisma/enums";
import config from "../config";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { jwtUtils } from "../utils/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        fullName: string;
        email: string;
        role: Role;
      };
    }
  }
}

const createAuthError = (message: string, statusCode: number) => {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
};

export const auth = (...requiredRoles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken
      ? req.cookies.accessToken
      : req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization?.split(" ")[1]
        : req.headers.authorization;

    if (!token) {
      throw createAuthError(
        "You are not logged in. Please login to access to resource.",
        httpStatus.UNAUTHORIZED,
      );
    }

    const verifiedToken = jwtUtils.varifyToken(token, config.jwt_access_secret);

    if (!verifiedToken.success) {
      throw createAuthError(
        "Your login session is invalid or expired. Please login again.",
        httpStatus.UNAUTHORIZED,
      );
    }

    const { email, fullName, id, role } = verifiedToken.data as JwtPayload;

    if (requiredRoles.length && !requiredRoles.includes(role)) {
      throw createAuthError(
        "Forbidden. You don't have permission to access this resource.",
        httpStatus.FORBIDDEN,
      );
    }

    const user = await prisma.users.findUnique({
      where: {
        id,
        fullName,
        email,
        role,
      },
    });

    if (!user) {
      throw createAuthError(
        "User not found. Please log in again.",
        httpStatus.UNAUTHORIZED,
      );
    }

    if (user.status === "SUSPENDED") {
      throw createAuthError(
        "Your account has been Suspended. Please contact support.",
        httpStatus.FORBIDDEN,
      );
    }

    req.user = {
      id,
      fullName,
      email,
      role,
    };

    next();
  });
};