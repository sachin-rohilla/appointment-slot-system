import { Request, Response, NextFunction } from "express";
import { createBookingService } from "../services/booking_service";

export const createBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotId } = req.body;
    const userId = (req as any).user.id;
    const booking = await createBookingService(userId, slotId);
    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
