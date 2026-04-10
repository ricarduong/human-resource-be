import { Router } from "express";
import { container } from "../containers/inversify.config";
import { EmployeeController } from "../controllers/EmployeeController";
import { TYPES } from "../constants/types";

const router = Router();
const employeeController = container.get<EmployeeController>(TYPES.EmployeeController);

router.get("/", (req, res, next) => employeeController.getAll(req, res, next));

export default router;
