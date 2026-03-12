import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { authorizeMiddleware } from "../middlewares/authorize_middleware";
import {
  createSlotController,
  getSlotController,
} from "../controllers/slot_controller";

const slotRouter = Router();

slotRouter.post(
  "/create",
  authMiddleware,
  authorizeMiddleware("admin"),
  createSlotController,
);

slotRouter.get("/all-slot-list", authMiddleware, getSlotController);

export default slotRouter;
