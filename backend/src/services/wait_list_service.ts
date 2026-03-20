import prisma from "../prisma";
import { AppError } from "../utils/app_error";

interface CreateWaitListServiceParams {
  userId: string;
  slotId: string;
}

export const createWaitListService = async ({
  userId,
  slotId,
}: CreateWaitListServiceParams) => {
  const now = new Date();

  return prisma.$transaction(
    async (tx) => {
      const slot = await tx.slot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new AppError("Slot not found", 404);
      }

      if (slot.isDeleted) {
        throw new AppError("Slot deleted", 400);
      }

      if (slot.state === "available") {
        throw new AppError("Slot is available - book it directly", 400);
      }

      if (slot.endTime < now) {
        throw new AppError("Slot already ended", 400);
      }

      const alreadyBooked = await tx.booking.findFirst({
        where: { userId, slotId },
      });

      if (alreadyBooked) {
        throw new AppError("You already booked this slot", 400);
      }

      const alreadyInWaitlist = await tx.waitlist.findFirst({
        where: { userId, slotId },
      });

      if (alreadyInWaitlist) {
        throw new AppError("Already in waitlist", 400);
      }

      const last = await tx.waitlist.findFirst({
        where: { slotId },
        orderBy: { position: "desc" },
      });

      const position = last ? last.position + 1 : 1;

      return tx.waitlist.create({
        data: {
          userId,
          slotId,
          position,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
};
