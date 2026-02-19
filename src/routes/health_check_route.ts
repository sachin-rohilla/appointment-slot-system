import { Router } from "express";
import { healthCheckController } from "../controllers/health_check_controller";

const healthCheckRouter = Router();

healthCheckRouter.get("/check", healthCheckController);

export default healthCheckRouter;
