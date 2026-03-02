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

export const getAllSlotsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const filter = {
    isDeleted: false,
  };

  const [slots, totalCount] = await Promise.all([
    prisma.slot.findMany({
      where: filter,
      take: limit,
      skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.slot.count({
      where: filter,
    }),
  ]);

  return {
    data: slots,
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
};

export const getDeletedSlotsService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const filter = {
    isDeleted: true,
  };

  const [slots, totalCount] = await Promise.all([
    prisma.slot.findMany({
      where: filter,
      take: limit,
      skip,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.slot.count({ where: filter }),
  ]);

  return {
    data: slots,
    page,
    limit,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  };
};

export const restoreSlotsService = async (slotIds: string[]) => {
  const restoreSlots = await prisma.slot.updateMany({
    where: {
      isDeleted: true,
      id: {
        in: slotIds,
      },
    },
    data: {
      isDeleted: false,
    },
  });
  if (restoreSlots.count === 0) {
    throw new AppError("No slots found with the given IDs", 404);
  }
  return restoreSlots;
};

export const deleteSlotsService = async (slotIds: string[]) => {
  const deletedSlots = await prisma.slot.updateMany({
    where: {
      isDeleted: false,
      id: {
        in: slotIds,
      },
    },
    data: {
      isDeleted: true,
    },
  });
  if (deletedSlots.count === 0) {
    throw new AppError("No slots found with the given IDs", 404);
  }
  return deletedSlots;
};
