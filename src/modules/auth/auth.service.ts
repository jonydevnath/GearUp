import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IloginUser, RegisterUserPayload } from "./auth.interface";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../../config";
import { jwtUtils } from "../../utils/jwt";

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
  const { fullName, email, password, role, phone } = payload;

  const isUserExist = await prisma.users.findUnique({
    where: { email },
  });

  if (isUserExist) {
    throw new Error("User email already exists");
  }

  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createdUser = await prisma.users.create({
    data: {
      fullName,
      email,
      passwordHash: hashedPassword,
      role,
      phone,
    },
  });

  const user = await prisma.users.findUnique({
    where: { id: createdUser.id },
    omit: { passwordHash: true },
  });

  return user;
};

const loginUser = async (payload: IloginUser) => {
  const { email, password } = payload;

  const user = await prisma.users.findFirstOrThrow({
    where: { email },
  });

  const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordMatch) {
    throw new Error("Password is incorrect!");
  }

  if (user.status === "SUSPENDED") {
    throw new Error("Your account has been suspended. Please contact support.");
  }

  const jwtPayload = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = jwtUtils.varifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );

  if (!verifiedRefreshToken.success) {
    throw new Error(verifiedRefreshToken.error);
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;

  const user = await prisma.users.findUniqueOrThrow({
    where: {
      id,
    },
  });

  if (user.status === "SUSPENDED") {
    throw new Error("User Is SUSPENDED!");
  }

  const jwtPayload = {
    id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions,
  );

  return { accessToken };
};

const currentUser = async (userId: string) => {
  const user = await prisma.users.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      passwordHash: true,
    },
  });

  return user;
};

export const authService = {
  registerUserIntoDB,
  loginUser,
  refreshToken,
  currentUser,
};
