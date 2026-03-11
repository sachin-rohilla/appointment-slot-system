import { z } from "zod";

export const joinWaitlistSchema = z.object({
  //   userId: z.string().uuid("Invalid userId"),
  slotId: z.string().uuid("Invalid slotId"),
});
