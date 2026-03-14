import { Request, Response, NextFunction } from "express";
import {
  createBookingService,
  getBookingsService,
} from "../services/booking_service";

export const createBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotId } = req.body;
    const { userId } = (req as any).user;
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

export const getBookingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userId } = (req as any).user;
    const bookings = await getBookingsService(userId);
    res.status(200).json({
      success: true,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
