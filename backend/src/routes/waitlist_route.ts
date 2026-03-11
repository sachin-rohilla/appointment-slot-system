import { Router } from "express";
import { authMiddleware } from "../middlewares/auth_middleware";
import { createWaitListController } from "../controllers/waitlist_controller";
import { validate } from "../middlewares/validation_middleware";
import { joinWaitlistSchema } from "../validations/waitlist_validation";

const waitListRouter = Router();

waitListRouter.post(
  "/create",
  authMiddleware,
  validate(joinWaitlistSchema),
  createWaitListController,
);

export default waitListRouter;
