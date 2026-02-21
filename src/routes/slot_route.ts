import { Router } from "express";
import {
  createSlotController,
  getAllSlotsController,
} from "../controllers/slot_controller";
import { validate } from "../middlewares/validation_middleware";
import { createSlotSchema } from "../validations/slot_validation";

const slotRouter = Router();

slotRouter.get("/all-list", getAllSlotsController);
slotRouter.post("/create", validate(createSlotSchema), createSlotController);

export default slotRouter;
