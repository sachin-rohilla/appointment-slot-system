import { Router } from "express";
import { createSlotController } from "../controllers/slot_controller";
import { validate } from "../middlewares/validation_middleware";
import { createSlotSchema } from "../validations/slot_validation";

const slotRouter = Router();

slotRouter.post("/create", validate(createSlotSchema), createSlotController);

export default slotRouter;
