import { Router } from "express";
import { validate } from "../middlewares/validation_middleware";
import { signinSchema, signupSchema } from "../validations/auth_validation";
import {
  signUpController,
  signInController,
} from "../controllers/auth_controller";

const authRouter = Router();

authRouter.post("/sign-up", validate(signupSchema), signUpController);
authRouter.post("/sign-in", validate(signinSchema), signInController);
export default authRouter;
