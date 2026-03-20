import prisma from "../prisma";
import { io } from "../server";

export const releaseHoldExpiredSlots = async () => {
  const now = new Date();

  try {
    const expiredSlots = await prisma.slot.updateMany({
      where: {
        state: "held",
        isDeleted: false,
        heldUntil: {
          not: null,
          lt: now,
        },
      },
      data: {
        state: "available",
        heldByUserId: null,
        heldUntil: null,
      },
    });

    if (expiredSlots.count > 0) {
      const nextUser = await prisma.waitlist.findFirst();
      if (nextUser) {
        const holdNextUser = await prisma.slot.updateMany({
          where: {
            id: nextUser.slotId,
            state: "available",
            isDeleted: false,
            endTime: {
              gt: now,
            },
          },
          data: {
            state: "held",
            heldByUserId: nextUser.userId,
            heldUntil: new Date(Date.now() + 5 * 60 * 1000),
          },
        });

        if (holdNextUser.count == 0) {
          console.log("No next user found");
        }
        await prisma.waitlist.delete({
          where: {
            id: nextUser.id,
          },
        });
        await prisma.waitlist.updateMany({
          where: {
            slotId: nextUser.slotId,
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
          slotId: nextUser.slotId,
          message: "Slot is available! Book fast",
          heldUntil: new Date(Date.now() + 5 * 60 * 1000),
        });

        console.log(`🔔 Notification sent to user ${nextUser.userId}`);
      }
    }
    console.log(`Released Hold ${expiredSlots.count} expired slots`);
  } catch (error) {
    console.error("Failed to release expired slots", error);
  }
};
