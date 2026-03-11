import prisma from "../prisma";
import { AppError } from "../utils/app_error";

export const createWaitListService = async (userId: string, slotId: string) => {
  const now = new Date();

  const slot = await prisma.slot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw new AppError("Slot not found", 404);
  }

  if (slot.endTime <= now) {
    throw new AppError("Slot already expired", 400);
  }

  if (slot.state === "available") {
    throw new AppError("Slot is available, please book directly", 400);
  }

  const existingBooking = await prisma.booking.findUnique({
    where: { slotId },
  });

  if (
    existingBooking?.userId === userId &&
    existingBooking.status === "confirmed"
  ) {
    throw new AppError("User already booked this slot", 400);
  }

  return prisma.$transaction(async (tx) => {
    const existingWaitlist = await tx.waitlist.findUnique({
      where: {
        slotId_userId: {
          slotId,
          userId,
        },
      },
    });

    if (existingWaitlist) {
      throw new AppError("User already in waitlist", 409);
    }

    const count = await tx.waitlist.count({
      where: { slotId },
    });

    const newWaitlist = await tx.waitlist.create({
      data: {
        userId,
        slotId,
        position: count + 1,
      },
    });

    return newWaitlist;
  });
};
