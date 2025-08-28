import { JwtConfig } from "../interfaces/jwt-config.interface";

export const getJwtConfig = (): JwtConfig => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined");
  }

  return {
    secret,
    expiresIn: "60m",
    refreshExpiresIn: "7d",
  };
};
