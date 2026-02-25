import { Request, Response, NextFunction } from "express";
import { signInService, signUpService } from "../services/auth_service";
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

export const signInController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const result = await signInService({ email, password });
    res.status(200).json({
      success: true,
      message: "User signed in successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
