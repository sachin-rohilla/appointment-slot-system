import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { createBookingController } from "../controllers/booking_controller";

const bookingRouter = Router();

bookingRouter.post("/", authMiddleware, createBookingController);

export default bookingRouter;
