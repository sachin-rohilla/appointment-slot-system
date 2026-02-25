import { z } from "zod";

export const createSlotSchema = z
  .object({
    resource: z.string().min(1, "resource is required"),

    startTime: z.string().datetime({
      message: "startTime must be ISO datetime",
    }),

    endTime: z.string().datetime({
      message: "endTime must be ISO datetime",
    }),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return start < end;
    },
    {
      message: "startTime must be before endTime",
      path: ["endTime"],
    },
  )
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);

      const durationMs = end.getTime() - start.getTime();
      const fourHoursMs = 4 * 60 * 60 * 1000;

      return durationMs <= fourHoursMs;
    },
    {
      message: "Slot duration cannot exceed 4 hours",
      path: ["endTime"],
    },
  );
