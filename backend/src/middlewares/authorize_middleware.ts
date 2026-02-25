import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app_error";

export const authorizeMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError("You are not authorized to perform this action", 403);
    }

    next();
  };
};
