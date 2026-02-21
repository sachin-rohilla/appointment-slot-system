import { Request, Response, NextFunction } from "express";
import {
  createSlotService,
  getAllSlotsService,
} from "../services/slot_service";

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
