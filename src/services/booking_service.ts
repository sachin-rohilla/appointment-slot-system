import prisma from "../prisma";
import { AppError } from "../utils/app_error";

export const createBookingService = async (userId: string, slotId: string) => {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.slot.updateMany({
      where: {
        id: slotId,
        state: "held",
        heldByUserId: userId,
        heldUntil: { gte: now },
      },
      data: {
        state: "booked",
        heldByUserId: null,
        heldUntil: null,
      },
    });
    if (updated.count === 0) {
      throw new AppError("Slot not available for booking", 400);
    }

    const booking = await tx.booking.create({
      data: {
        userId,
        slotId,
        status: "confirmed",
      },
    });

    return booking;
  });
};
