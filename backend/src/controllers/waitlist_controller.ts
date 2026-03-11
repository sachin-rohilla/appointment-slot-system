import { Request, Response, NextFunction } from "express";
import { createWaitListService } from "../services/waitlist_service";
import { AppError } from "../utils/app_error";

export const createWaitListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotId } = req.body;
    const userId = (req as any).user.userId;

    if (!slotId) {
      throw new AppError("Slot ID is required", 400);
    }

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const waitlist = await createWaitListService(userId, slotId);

    res.status(201).json({
      success: true,
      message: "Successfully joined waiting list",
      data: waitlist,
    });
  } catch (error) {
    next(error);
  }
};
