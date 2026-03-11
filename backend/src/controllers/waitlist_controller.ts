import { Request, Response, NextFunction } from "express";

export const createWaitListController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // TODO: Implement waitlist creation logic
    res.status(201).json({ message: "Waitlist created successfully" });
  } catch (error) {
    next(error);
  }
};
