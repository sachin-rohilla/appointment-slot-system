import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { authorizeMiddleware } from "../middlewares/authorize_middleware";
import {
  createSlotController,
  getSlotController,
  updateSlotController,
} from "../controllers/slot_controller";

const slotRouter = Router();

slotRouter.post(
  "/create",
  authMiddleware,
  authorizeMiddleware("admin"),
  createSlotController,
);

slotRouter.get("/all-slot-list", authMiddleware, getSlotController);

slotRouter.patch("/update/:slotId", authMiddleware, updateSlotController);

export default slotRouter;
