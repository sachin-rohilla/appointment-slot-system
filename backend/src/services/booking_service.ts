import prisma from "../prisma";
import { AppError } from "../utils/app_error";

export const createBookingService = async (userId: string, slotId: string) => {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new AppError("Slot not found", 404);
    }

    if (slot.isDeleted) {
      throw new AppError("Slot is deleted", 400);
    }

    if (slot.endTime < now) {
      throw new AppError("Slot time already passed", 400);
    }

    if (slot.state !== "held") {
      throw new AppError("Slot is not available", 400);
    }

    if (slot.heldUntil && slot.heldUntil < now) {
      throw new AppError("Slot hold expired", 400);
    }

    if (slot.heldByUserId !== userId) {
      throw new AppError("Slot is not held by you", 403);
    }

    const booking = await tx.booking.create({
      data: {
        userId,
        slotId,
      },
    });

    await tx.slot.update({
      where: { id: slotId },
      data: {
        state: "booked",
        heldByUserId: null,
        heldUntil: null,
      },
    });

    return booking;
  });
};

export const getBookingsService = (userId: string) => {
  return prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      slot: true,
    },
  });
};
