import { Router } from "express";
import { container } from "../containers/inversify.config";
import { AuthController } from "../controllers/AuthController";
import { TYPES } from "../constants/types";

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

router.post("/google", (req, res, next) => authController.googleLogin(req, res, next));

export default router;
