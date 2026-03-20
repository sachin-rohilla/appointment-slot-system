import { Request, Response, NextFunction } from "express";
import { createWaitListService } from "../services/wait_list_service";

export const waitListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotId } = req.body;
    const { userId } = (req as any).user;
    await createWaitListService({ slotId, userId });
    res.status(201).json({ message: "Join Wait list successfully" });
  } catch (error) {
    next(error);
  }
};
