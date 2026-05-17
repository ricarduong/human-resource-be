import { Router } from "express";
import { container } from "../containers/inversify.config";
import { TeamController } from "../controllers/TeamController";
import { TYPES } from "../constants/types";
import { validateCreateTeam } from "../middlewares/validate-create-team.middleware";

const router = Router();
const teamController = container.get<TeamController>(TYPES.TeamController);

router.get("/", (req, res, next) => teamController.getAll(req, res, next));
router.get("/:id", (req, res, next) => teamController.getById(req, res, next));
router.post("/", validateCreateTeam, (req, res, next) => teamController.create(req, res, next));

export default router;
