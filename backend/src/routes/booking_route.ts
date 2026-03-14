import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import {
  createBookingController,
  getBookingsController,
} from "../controllers/booking_controller";

const bookingRouter = Router();

bookingRouter.post("/", authMiddleware, createBookingController);
bookingRouter.get("/bookings-list", authMiddleware, getBookingsController);

export default bookingRouter;
