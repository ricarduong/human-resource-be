import { Router } from "express";
import { container } from "../containers/inversify.config";
import { PolicyController } from "../controllers/PolicyController";
import { TYPES } from "../constants/types";

const router = Router();
const policyController = container.get<PolicyController>(TYPES.PolicyController);

router.get("/", (req, res, next) => policyController.getAll(req, res, next));

export default router;
