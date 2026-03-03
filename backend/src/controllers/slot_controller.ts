import { Request, Response, NextFunction } from "express";
import {
  createSlotService,
  deleteSlotsService,
  getAllSlotsService,
  getDeletedSlotsService,
  restoreSlotsService,
  updateSlotsService,
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
    const { page, limit } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Number(limit) || 10, 10);

    const slots = await getAllSlotsService(pageNumber, limitNumber);
    res.status(200).json({
      success: true,
      data: slots.data,
      page: slots.page,
      limit: slots.limit,
      totalCount: slots.totalCount,
      totalPages: slots.totalPages,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeletedSlotsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit } = req.query;
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Number(limit) || 10, 10);
    const slots = await getDeletedSlotsService(pageNumber, limitNumber);
    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

export const restoreSlotsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slotIds } = req.body;
    if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
      throw new AppError("slotIds must be a non-empty array", 400);
    }
    await restoreSlotsService(slotIds);
    res.status(200).json({
      success: true,
      message: "Slots restored successfully",
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

export const updateSlotsController = async (
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
      throw new AppError("User ID is required", 400);
    }
    await updateSlotsService(slotId as string, userId as string);
    res.status(200).json({
      success: true,
      message: "Slot updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
