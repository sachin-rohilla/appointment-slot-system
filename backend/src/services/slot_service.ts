import prisma from "../prisma";
import { AppError } from "../utils/app_error";

interface CreateSlotPayload {
  resource: string;
  startTime: string;
  endTime: string;
}

export const createSlotService = async (payload: CreateSlotPayload) => {
  return await prisma.$transaction(
    async (tx) => {
      const startDate = new Date(payload.startTime);
      const endDate = new Date(payload.endTime);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new AppError("Invalid datetime format", 400);
      }

      if (startDate >= endDate) {
        throw new AppError("Start time must be before end time", 400);
      }

      const slot = await tx.slot.findFirst({
        where: {
          resource: payload.resource,
          AND: {
            startTime: {
              lt: endDate,
            },
            endTime: {
              gt: startDate,
            },
          },
        },
      });

      if (slot) {
        throw new AppError("Slot already exists", 400);
      }

      return await tx.slot.create({
        data: {
          resource: payload.resource,
          startTime: startDate,
          endTime: endDate,
        },
      });
    },
    {
      isolationLevel: "Serializable",
    },
  );
};

export const getSlotService = () => {
  return prisma.slot.findMany({
    where: {
      isDeleted: false,
    },
  });
};

export const getDeleteSlotService = () => {
  return prisma.slot.findMany({
    where: {
      isDeleted: true,
    },
  });
};

export const updateSlotService = async (userId: string, slotId: string) => {
  const now = new Date();
  const updatedSlots = await prisma.slot.updateMany({
    where: {
      id: slotId,
      endTime: {
        gt: now,
      },
      OR: [
        {
          state: "available",
        },
        {
          state: "held",
        },
      ],
    },
    data: {
      state: "held",
      heldByUserId: userId,
      heldUntil: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  if (updatedSlots.count === 0) {
    throw new AppError("Slot not found or already held/booked", 404);
  }

  return updatedSlots;
};

export const deleteSlotService = async (slotIds: string[]) => {
  const deletedData = await prisma.slot.updateMany({
    where: {
      id: {
        in: slotIds,
      },
      isDeleted: false,
    },
    data: {
      isDeleted: true,
    },
  });
  return deletedData;
};

export const undoSlotService = async (slotIds: string[]) => {
  const updateData = await prisma.slot.updateMany({
    where: {
      id: {
        in: slotIds,
      },
      isDeleted: true,
    },
    data: {
      isDeleted: false,
    },
  });

  return updateData;
};
