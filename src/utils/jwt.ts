import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};

const varifyToken = (token: string, secret: string) => {
  try {
    const varifiedToken = jwt.verify(token, secret);
    return {
      success: true,
      data: varifiedToken,
    };
  } catch (error: any) {
    console.log("Token varification failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const jwtUtils = {
  createToken,
  varifyToken,
};
