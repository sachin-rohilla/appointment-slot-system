import { Request, Response, NextFunction } from "express";
import {
  createSlotService,
  deleteSlotsService,
  getAllSlotsService,
} from "../services/slot_service";
import { AppError } from "../utils/app_error";

export const createSlotController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { resource, startTime, endTime } = req.body;
    await createSlotService({ resource, startTime, endTime });
    res.status(201).json({
      success: true,
      message: "Slot created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSlotsListController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const slots = await getAllSlotsService();
    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSlotsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotIds } = req.body;
    if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
      throw new AppError("slotIds must be a non-empty array", 400);
    }
    await deleteSlotsService(slotIds);
    res.status(200).json({
      success: true,
      message: "Slots deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
