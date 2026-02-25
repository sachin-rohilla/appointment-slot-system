import prisma from "../prisma";
import { AppError } from "../utils/app_error";

interface CreateSlotServiceInput {
  resource: string;
  startTime: string;
  endTime: string;
}

export const createSlotService = async ({
  resource,
  startTime,
  endTime,
}: CreateSlotServiceInput) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (start >= end) {
    throw new AppError("Start time must be before end time", 400);
  }

  const overLapSlots = await prisma.slot.findFirst({
    where: {
      resource,
      AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
    },
  });

  if (overLapSlots) {
    throw new AppError(
      "A slot already exists for this resource at this time",
      400,
    );
  }
  return prisma.slot.create({
    data: {
      resource,
      startTime,
      endTime,
    },
  });
};

export const getAllSlotsService = () => {
  return prisma.slot.findMany({ where: { state: "available" } });
};

export const updateSlotService = async (userId: string, slotId: string) => {
  const now = new Date();

  const result = await prisma.slot.updateMany({
    where: {
      id: slotId,
      endTime: { gt: now },
      OR: [
        { state: "available" },
        {
          state: "held",
          heldUntil: { lt: now },
        },
        {
          state: "held",
          heldByUserId: userId,
        },
      ],
    },
    data: {
      state: "held",
      heldByUserId: userId,
      heldUntil: new Date(now.getTime() + 15 * 60 * 1000),
    },
  });

  if (result.count === 0) {
    throw new AppError("Slot not available", 400);
  }

  return prisma.slot.findUnique({
    where: { id: slotId },
  });
};
