import jwt, { Secret, SignOptions } from "jsonwebtoken";

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

if (!JWT_SECRET || !JWT_EXPIRES_IN) {
  console.error(
    "JWT_SECRET or JWT_EXPIRES_IN is not defined in environment variables",
  );
  process.exit(1);
}

export const generateAccessToken = (userId: string, role: string): string => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
