import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { waitListController } from "../controllers/wait_list_controller";
const waitListRouter = Router();

waitListRouter.post("/create", authMiddleware, waitListController);
export default waitListRouter;
