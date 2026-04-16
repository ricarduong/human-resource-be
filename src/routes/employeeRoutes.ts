import { Router } from "express";
import { container } from "../containers/inversify.config";
import { EmployeeController } from "../controllers/EmployeeController";
import { TYPES } from "../constants/types";
import { validateCreateEmployee } from "../middlewares/validate-create-employee.middleware";

const router = Router();
const employeeController = container.get<EmployeeController>(TYPES.EmployeeController);


router.get("/", (req, res, next) => employeeController.getAll(req, res, next));
router.get("/:id", (req, res, next) => employeeController.getById(req, res, next));
router.post("/", validateCreateEmployee, (req, res, next) => employeeController.create(req, res, next));
router.put("/:id", (req, res, next) => employeeController.update(req, res, next));
router.delete("/:id", (req, res, next) => employeeController.delete(req, res, next));

export default router;
