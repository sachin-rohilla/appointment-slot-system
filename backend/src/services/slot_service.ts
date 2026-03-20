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

export const getSlotService = async (
  userId: string,
  page: number,
  limit: number,
  filter?: any,
) => {
  const skip = (page - 1) * limit;

  const total = await prisma.slot.count({
    where: { isDeleted: false },
  });

  const where: any = {
    isDeleted: false,
  };

  if (filter.resourceName) {
    where.resource = {
      contains: filter.resourceName,
      mode: "insensitive",
    };
  }

  if (filter.startDate) {
    where.startTime = {
      gte: new Date(filter.startDate),
    };
  }

  const slots = await prisma.slot.findMany({
    where,
    select: {
      id: true,
      resource: true,
      startTime: true,
      endTime: true,
      state: true,
      heldByUserId: true,
      heldUntil: true,
      createdAt: true,
      booking: { select: { id: true, userId: true } },
      waitlist: { select: { userId: true } },
    },
    skip,
    take: limit,
  });

  const result = slots.map((slot) => ({
    id: slot.id,
    resource: slot.resource,
    startTime: slot.startTime,
    endTime: slot.endTime,
    state: slot.state,
    heldByUserId: slot.heldByUserId,
    heldUntil: slot.heldUntil,
    bookingId: slot.booking?.id,
    createdAt: slot.createdAt,
    isBookedByUser: slot.booking?.userId === userId,
    isInWaitlist: slot.waitlist.some((w) => w.userId === userId),
    canJoinWaitlist:
      (slot.state === "held" &&
        slot.heldByUserId !== userId &&
        !slot.waitlist.some((w) => w.userId === userId)) ||
      (slot.state === "booked" &&
        slot.booking &&
        slot.booking.userId !== userId &&
        !slot.waitlist.some((w) => w.userId === userId)),
  }));

  return {
    result,
    page,
    limit,
    total_pages: Math.ceil(total / limit),
    total,
  };
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

export const deleteSlotPermanentService = async (slotIds: string[]) => {
  return prisma.$transaction(async (tx) => {
    await tx.waitlist.deleteMany({
      where: {
        slotId: {
          in: slotIds,
        },
      },
    });
    await tx.booking.deleteMany({
      where: {
        slotId: {
          in: slotIds,
        },
      },
    });

    await tx.slot.deleteMany({
      where: {
        id: {
          in: slotIds,
        },
      },
    });
  });
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
