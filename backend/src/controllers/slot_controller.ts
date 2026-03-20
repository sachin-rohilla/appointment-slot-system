import { Request, Response, NextFunction } from "express";
import {
  createSlotService,
  deleteSlotPermanentService,
  deleteSlotService,
  getDeleteSlotService,
  getSlotService,
  undoSlotService,
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
    const { userId } = (req as any).user;
    const { page, limit, resource, startDate } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.max(Math.min(Number(limit) || 10, 10), 1);
    const resourceName = resource?.toString().trim() || "";
    const startDateStr = startDate?.toString().trim() || "";
    const filter: any = {};
    filter.resourceName = resourceName;
    filter.startDate = startDateStr;
    const result = await getSlotService(
      userId,
      pageNumber,
      limitNumber,
      filter,
    );
    res.status(200).json({
      success: true,
      data: result,
      message: "Slots fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getDeleteSlotController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getDeleteSlotService();
    res.status(200).json({
      success: true,
      data: result,
      message: "Deleted slots fetched successfully",
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
    const { userId } = (req as any).user;
    const { slotId } = req.params;
    await updateSlotService(userId, slotId as string);
    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSlotController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotIds } = req.body;
    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      throw new AppError("slotIds must be a non-empty array", 400);
    }
    const result = await deleteSlotService(slotIds);
    if (result.count === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No slots deleted. Either slots are booked or already deleted.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Slot deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSlotPermanentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotIds } = req.body;
    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      throw new AppError("slotIds must be a non-empty array", 400);
    }
    await deleteSlotPermanentService(slotIds);
    res.status(200).json({
      success: true,
      message: "Slot deleted permanently successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const undoSlotController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotIds } = req.body;
    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      throw new AppError("slotIds must be a non-empty array", 400);
    }
    const result = await undoSlotService(slotIds);
    if (result.count === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No slots updated. Either slots are not deleted or already active.",
      });
    }
    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
