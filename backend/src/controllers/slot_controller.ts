import { Request, Response, NextFunction } from "express";
import { createSlotService, getSlotService } from "../services/slot_service";

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

export const getSlotController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getSlotService();
    res.status(200).json({
      succesS: true,
      data: result,
      message: "Slots fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
