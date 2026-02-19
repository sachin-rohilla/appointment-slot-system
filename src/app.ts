import express from "express";
import dotenv from "dotenv";
import healthCheckRouter from "./routes/health_check_route";
import { notFoundMiddleware } from "./middlewares/not_found_middleware";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/v1/health", healthCheckRouter);
app.use(notFoundMiddleware);
export default app;
