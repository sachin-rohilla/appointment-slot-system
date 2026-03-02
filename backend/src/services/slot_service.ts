import prisma from "../prisma";
import { AppError } from "../utils/app_error";

interface CreateSlotServiceInput {
  resource: string;
  startTime: Date;
  endTime: Date;
}

export const createSlotService = async (payload: CreateSlotServiceInput) => {
  return await prisma.$transaction(async (tx) => {
    const slot = await tx.slot.findFirst({
      where: {
        resource: payload.resource,
        AND: [
          {
            startTime: {
              lt: payload.endTime,
            },
            endTime: {
              gt: payload.startTime,
            },
          },
        ],
      },
    });
    if (slot) {
      throw new AppError(
        "A slot already exists for this resource at this time",
        400,
      );
    }
    const newSlot = await tx.slot.create({
      data: {
        resource: payload.resource,
        startTime: payload.startTime,
        endTime: payload.endTime,
      },
    });
    return newSlot;
  });
};
