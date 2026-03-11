import prisma from "../prisma";

export const expiredPastSlots = async () => {
  const now = new Date();

  try {
    console.log(`🧹 [CRON] Slot cleanup started at ${now.toISOString()}`);

    const result = await prisma.slot.updateMany({
      where: {
        endTime: { lt: now },
        state: { in: ["available", "held"] },
      },
      data: {
        state: "available",
        heldByUserId: null,
        heldUntil: null,
      },
    });

    console.log(
      `✅ [CRON] Slot cleanup completed. Expired slots released: ${result.count}`,
    );
  } catch (error) {
    console.error("❌ [CRON] Slot cleanup failed:", error);
  }
};
