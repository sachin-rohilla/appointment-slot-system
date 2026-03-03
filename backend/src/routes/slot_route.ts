import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { authorizeMiddleware } from "../middlewares/authorize_middleware";
import {
  createSlotController,
  deleteSlotsController,
  getAllSlotsListController,
  getDeletedSlotsController,
  restoreSlotsController,
  updateSlotsController,
} from "../controllers/slot_controller";

const slotRouter = Router();

slotRouter.post(
  "/create",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  createSlotController,
);
slotRouter.get("/all-list", authMiddleware, getAllSlotsListController);
slotRouter.get(
  "/deleted-list",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  getDeletedSlotsController,
);
slotRouter.patch(
  "/restore",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  restoreSlotsController,
);
slotRouter.delete(
  "/delete",
  authMiddleware,
  authorizeMiddleware("ADMIN"),
  deleteSlotsController,
);

slotRouter.patch("/hold/:slotId", authMiddleware, updateSlotsController);

export default slotRouter;
