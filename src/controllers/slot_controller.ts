import { Request, Response, NextFunction } from "express";
import {
  createSlotService,
  getAllSlotsService,
  updateSlotService,
} from "../services/slot_service";
import { AppError } from "../utils/app_error";

export const createSlotController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { resource, startTime, endTime } = req.body;
    await createSlotService({
      resource,
      startTime,
      endTime,
    });
    res.status(201).json({
      message: "Slot created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSlotsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slots = await getAllSlotsService();
    res.status(200).json({
      success: true,
      data: slots,
      message: "Slots retrieved successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const updateSlotController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotId } = req.params;
    const { userId } = (req as any).user;
    if (!slotId) {
      throw new AppError("Slot ID is required", 400);
    }
    if (!userId) {
      throw new AppError("User not found", 404);
    }
    await updateSlotService(userId, slotId as string);
    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
