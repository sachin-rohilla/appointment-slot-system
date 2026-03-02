import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { authorizeMiddleware } from "../middlewares/authorize_middleware";
import { createSlotController } from "../controllers/slot_controller";

const slotRouter = Router();

slotRouter.post(
  "/create",
  authMiddleware,
  authorizeMiddleware("admin"),
  createSlotController,
);

export default slotRouter;
