import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { createBookingController } from "../controllers/booking_controller";
import { validate } from "../middlewares/validation_middleware";
import { createBookingSchema } from "../validations/booking_validation";

const bookingRouter = Router();

bookingRouter.post(
  "/create",
  authMiddleware,
  validate(createBookingSchema),
  createBookingController,
);
export default bookingRouter;
