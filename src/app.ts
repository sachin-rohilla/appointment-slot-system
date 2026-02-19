import express from "express";
import dotenv from "dotenv";
import healthCheckRouter from "./routes/health_check_route";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/v1/health", healthCheckRouter);
export default app;
