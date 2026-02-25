import { Request, Response, NextFunction } from "express";
export const healthCheckController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.status(200).json({
      success: true,
      status: "ok",
      message: "Appointment Slot System is running successfully",
      timeStamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
