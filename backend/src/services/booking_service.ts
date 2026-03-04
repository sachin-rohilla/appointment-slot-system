import prisma from "../prisma";
import { AppError } from "../utils/app_error";

export const createBookingService = async (userId: string, slotId: string) => {
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    const result = await tx.slot.updateMany({
      where: {
        id: slotId,
        heldByUserId: userId,
        state: "held",
        heldUntil: { gt: now },
      },
      data: {
        state: "booked",
        heldUntil: null,
        heldByUserId: null,
      },
    });

    if (result.count === 0) {
      throw new AppError("Slot hold expired or already booked", 400);
    }

    return await tx.booking.create({
      data: {
        userId,
        slotId,
        status: "confirmed",
      },
    });
  });
};

export const getUserBookingsService = async (userId: string) => {
  return await prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      slot: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const cancelBookingService = async (
  bookingId: string,
  userId: string,
) => {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const updatedBooking = await tx.booking.updateMany({
      where: {
        id: bookingId,
        userId,
        status: "confirmed",
      },
      data: {
        status: "cancelled",
      },
    });

    if (updatedBooking.count === 0) {
      throw new AppError("Booking already cancelled or unauthorized", 400);
    }

    const updatedSlot = await tx.slot.updateMany({
      where: {
        id: booking.slotId,
        state: "booked",
        endTime: { gt: now },
      },
      data: {
        state: "available",
      },
    });

    if (updatedSlot.count === 0) {
      throw new AppError("Unable to cancel booking. Please try again.", 500);
    }

    return { success: true };
  });
};
