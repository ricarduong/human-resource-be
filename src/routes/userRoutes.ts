import { Router } from "express";
import { container } from "../containers/inversify.config";
import { UserController } from "../controllers/UserController";
import { TYPES } from "../constants/types";
import { id as validateUserId, update as validateUpdateUser } from "../middlewares/user";

const router = Router();
const userController = container.get<UserController>(TYPES.UserController);

router.get("/", (req, res, next) => userController.getAll(req, res, next));
router.get("/:email", (req, res, next) => userController.getByEmail(req, res, next));
router.patch("/:id", validateUpdateUser, (req, res, next) => userController.update(req, res, next));
router.delete("/:id", validateUserId, (req, res, next) => userController.delete(req, res, next));

export default router;
