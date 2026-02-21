import { Request, Response, NextFunction } from "express";
import { signUpService } from "../services/auth_service";
export const signUpController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    await signUpService({ name, email, password });

    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const signInController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
  } catch (error) {
    next(error);
  }
};
