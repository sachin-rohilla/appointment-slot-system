import { Router } from "express";
import {
  createSlotController,
  getAllSlotsController,
  updateSlotController,
} from "../controllers/slot_controller";
import { validate } from "../middlewares/validation_middleware";
import { createSlotSchema } from "../validations/slot_validation";
import { authMiddleware } from "../middlewares/auth_middleware";
import { authorizeMiddleware } from "../middlewares/authorize_middleware";

const slotRouter = Router();

slotRouter.post(
  "/create",
  authMiddleware,
  authorizeMiddleware("admin"),
  validate(createSlotSchema),
  createSlotController,
);

slotRouter.get("/all-list", authMiddleware, getAllSlotsController);
slotRouter.patch("/hold/:slotId", authMiddleware, updateSlotController);

export default slotRouter;
