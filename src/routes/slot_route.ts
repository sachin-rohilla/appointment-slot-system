import { Router } from "express";
import {
  createSlotController,
  getAllSlotsController,
} from "../controllers/slot_controller";
import { validate } from "../middlewares/validation_middleware";
import { createSlotSchema } from "../validations/slot_validation";
import { AuthMiddleware } from "../middlewares/auth_middleware";

const slotRouter = Router();

slotRouter.get("/all-list", AuthMiddleware, getAllSlotsController);
slotRouter.post(
  "/create",
  AuthMiddleware,
  validate(createSlotSchema),
  createSlotController,
);

export default slotRouter;
