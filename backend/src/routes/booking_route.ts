import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import {
  cancelBookingController,
  createBookingController,
  getUserBookingsController,
} from "../controllers/booking_controller";

const bookingRouter = Router();

bookingRouter.post("/create", authMiddleware, createBookingController);
bookingRouter.get("/user", authMiddleware, getUserBookingsController);
bookingRouter.patch(
  "/cancel/:bookingId",
  authMiddleware,
  cancelBookingController,
);

export default bookingRouter;
