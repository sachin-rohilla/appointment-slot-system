import prisma from "../prisma";
import { AppError } from "../utils/app_error";
import { getWaitListUser } from "../utils/getWaitListUser";
import { io } from "../server";

export const createBookingService = async (userId: string, slotId: string) => {
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) throw new AppError("Slot not found", 404);
    if (slot.isDeleted) throw new AppError("Slot is deleted", 400);
    if (slot.endTime < now) throw new AppError("Slot time already passed", 400);
    if (slot.state !== "held") throw new AppError("Slot is not available", 400);
    if (slot.heldUntil && slot.heldUntil < now)
      throw new AppError("Slot hold expired", 400);
    if (slot.heldByUserId !== userId)
      throw new AppError("Slot is not held by you", 403);

    let booking = await tx.booking.findFirst({
      where: { slotId },
    });

    if (booking) {
      if (booking.status === "cancelled") {
        booking = await tx.booking.update({
          where: { id: booking.id },
          data: { userId, status: "confirmed" },
        });
      } else if (booking.status === "confirmed") {
        throw new AppError("Slot already booked", 409);
      }
    } else {
      booking = await tx.booking.create({
        data: { userId, slotId },
      });
    }

    const slotUpdate = await tx.slot.updateMany({
      where: { id: slotId, state: "held", heldByUserId: userId },
      data: { state: "booked", heldByUserId: null, heldUntil: null },
    });

    if (slotUpdate.count === 0) {
      throw new AppError("Slot already booked", 409);
    }

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

export const cancelBookingService = async (
  bookingId: string,
  userId: string,
) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findFirst({
      where: {
        id: bookingId,
        userId,
      },
    });

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const bookingResult = await tx.booking.updateMany({
      where: {
        id: bookingId,
        userId,
        status: "confirmed",
      },
      data: {
        status: "cancelled",
      },
    });

    if (bookingResult.count === 0) {
      throw new AppError("Booking already cancelled", 400);
    }

    const slotResult = await tx.slot.updateMany({
      where: {
        id: booking.slotId,
        state: "booked",
      },
      data: {
        state: "available",
        heldByUserId: null,
        heldUntil: null,
      },
    });

    if (slotResult.count === 0) {
      throw new AppError("Slot already released", 400);
    }

    const nextUser = await getWaitListUser(tx, booking.slotId);

    if (nextUser) {
      const holdResult = await tx.slot.updateMany({
        where: {
          id: booking.slotId,
          state: "available",
          isDeleted: false,
          endTime: {
            gt: new Date(),
          },
        },
        data: {
          state: "held",
          heldByUserId: nextUser.userId,
          heldUntil: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      if (holdResult.count === 0) {
        throw new AppError("Failed to hold slot for waitlist user", 400);
      }

      await tx.waitlist.delete({
        where: { id: nextUser.id },
      });

      await tx.waitlist.updateMany({
        where: {
          slotId: booking.slotId,
          position: {
            gt: nextUser.position,
          },
        },
        data: {
          position: {
            decrement: 1,
          },
        },
      });

      io.to(nextUser.userId).emit("slotAvailable", {
        slotId: booking.slotId,
        message: "Slot is available! Book fast",
        heldUntil: new Date(Date.now() + 5 * 60 * 1000),
      });

      console.log(`🔔 Notification sent to user ${nextUser.userId}`);
    } else {
      console.log("ℹ️ No users in waitlist for this slot");
    }

    return {
      bookingId,
      status: "cancelled",
    };
  });
};
