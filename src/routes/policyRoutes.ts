import { Router } from "express";
import { container } from "../containers/inversify.config";
import { PolicyController } from "../controllers/PolicyController";
import { TYPES } from "../constants/types";
import { validateCreatePolicy } from "../middlewares/validate-create-policy.middleware";
import { validateUpdatePolicy } from "../middlewares/validate-update-policy.middleware";

const router = Router();
const policyController = container.get<PolicyController>(TYPES.PolicyController);

router.get("/", (req, res, next) => policyController.getAll(req, res, next));
router.post("/", validateCreatePolicy, (req, res, next) => policyController.create(req, res, next));
router.patch("/:id", validateUpdatePolicy, (req, res, next) => policyController.update(req, res, next));

export default router;
