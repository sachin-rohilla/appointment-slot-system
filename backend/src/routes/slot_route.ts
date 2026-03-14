import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { authorizeMiddleware } from "../middlewares/authorize_middleware";
import {
  createSlotController,
  deleteSlotController,
  getDeleteSlotController,
  getSlotController,
  undoSlotController,
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

slotRouter.get("/deleted-slot-list", authMiddleware, getDeleteSlotController);

slotRouter.patch("/update/:slotId", authMiddleware, updateSlotController);

slotRouter.delete(
  "/delete",
  authMiddleware,
  authorizeMiddleware("admin"),
  deleteSlotController,
);

slotRouter.patch("/undo", authMiddleware, undoSlotController);

export default slotRouter;
