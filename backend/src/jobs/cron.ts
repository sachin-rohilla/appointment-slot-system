import cron from "node-cron";
import { releaseExpiredHolds } from "./releaseExpiredHolds ";
import { expiredPastSlots } from "./expiredPastSlots";

cron.schedule("* * * * *", async () => {
  await releaseExpiredHolds();
  await expiredPastSlots();
});
