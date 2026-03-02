import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { authorizeMiddleware } from "../middlewares/authorize_middleware";
import {
  createSlotController,
  deleteSlotsController,
  getAllSlotsListController,
} from "../controllers/slot_controller";

const slotRouter = Router();

slotRouter.post(
  "/create",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  createSlotController,
);
slotRouter.get("/all-list", authMiddleware, getAllSlotsListController);
slotRouter.delete(
  "/delete",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  deleteSlotsController,
);

export default slotRouter;
