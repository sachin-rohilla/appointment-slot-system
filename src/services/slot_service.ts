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
  return prisma.slot.findMany();
};
