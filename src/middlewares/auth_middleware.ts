import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accessToken = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(accessToken);

    (req as any).user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
