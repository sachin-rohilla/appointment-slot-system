import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import {
  cancelBookingController,
  createBookingController,
  getBookingsController,
} from "../controllers/booking_controller";

const bookingRouter = Router();

bookingRouter.post("/", authMiddleware, createBookingController);
bookingRouter.get("/bookings-list", authMiddleware, getBookingsController);
bookingRouter.patch(
  "/cancel-booking/:bookingId",
  authMiddleware,
  cancelBookingController,
);

export default bookingRouter;
