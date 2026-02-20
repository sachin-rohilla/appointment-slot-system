import { Request, Response, NextFunction } from "express";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const message = err.message;
  const statusCode = err.statusCode || 500;
  console.error("❌ Error:", {
    message: message,
    stack: err.stack,
    status: statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? "Internal server error" : message,
  });
};
