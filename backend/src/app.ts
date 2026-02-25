import express from "express";
import dotenv from "dotenv";
import healthCheckRouter from "./routes/health_check_route";
import { notFoundMiddleware } from "./middlewares/not_found_middleware";
import slotRouter from "./routes/slot_route";
import { errorMiddleware } from "./middlewares/error_middleware";
import authRouter from "./routes/auth_route";
import bookingRouter from "./routes/booking_route";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/v1/health", healthCheckRouter);
app.use("/api/v1/slots", slotRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/bookings", bookingRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
export default app;
