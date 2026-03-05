import prisma from "../prisma";

export const releaseExpiredHolds = async () => {
  const now = new Date();

  console.log(
    `🧹 ⏳ [CRON] Checking for expired slot holds at ${now.toISOString()}`,
  );

  try {
    const result = await prisma.slot.updateMany({
      where: {
        state: "held",
        heldUntil: {
          lt: now,
        },
      },
      data: {
        state: "available",
        heldByUserId: null,
        heldUntil: null,
      },
    });

    console.log(`✅ [CRON] Expired holds released: ${result.count}`);
  } catch (error) {
    console.error(`❌ [CRON] Failed to release expired holds`, error);
  }
};
