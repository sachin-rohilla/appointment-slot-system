export const getWaitListUser = async (tx: any, slotId: string) => {
  return tx.waitlist.findFirst({
    where: { slotId },
    orderBy: { position: "asc" },
  });
};
