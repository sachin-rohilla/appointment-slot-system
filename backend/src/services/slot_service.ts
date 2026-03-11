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

export const getAllSlotsService = async (
  page: number,
  limit: number,
  userId?: string,
) => {
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
      include: {
        booking: {
          where: {
            status: "confirmed",
          },
          select: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        waitlist: userId
          ? {
              where: {
                userId: userId,
              },
              select: {
                userId: true,
                slotId: true,
                position: true,
              },
            }
          : false, // Don't include waitlist if no userId
      },
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

export const updateSlotsService = async (slotId: string, userId: string) => {
  const now = new Date();
  const HOLD_DURATION_MS = 5 * 60 * 1000;

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
      ],
    },
    data: {
      state: "held",
      heldUntil: new Date(now.getTime() + HOLD_DURATION_MS),
      heldByUserId: userId,
    },
  });

  if (result.count === 0) {
    throw new AppError("Slot is not available or already booked", 400);
  }

  return true;
};
