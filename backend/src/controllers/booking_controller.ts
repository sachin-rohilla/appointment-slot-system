import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app_error";
import {
  cancelBookingService,
  createBookingService,
  getUserBookingsService,
} from "../services/booking_service";

export const createBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotId } = req.body;
    const userId = (req as any).user.userId;

    if (!slotId) {
      throw new AppError("Slot ID is required", 400);
    }

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const booking = await createBookingService(userId, slotId as string);

    res.status(201).json({
      success: true,
      message: "Booking confirmed successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelBookingController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { bookingId } = req.params;
    const userId = (req as any).user.userId;

    if (!bookingId) {
      throw new AppError("Booking ID not provided", 400);
    }

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    await cancelBookingService(bookingId as string, userId);

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookingsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const bookings = await getUserBookingsService(userId);

    res.status(200).json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};
