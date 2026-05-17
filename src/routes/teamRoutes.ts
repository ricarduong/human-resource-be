import { Router } from "express";
import { container } from "../containers/inversify.config";
import { TeamController } from "../controllers/TeamController";
import { TYPES } from "../constants/types";
import { create as validateCreateTeam } from "../middlewares/team";

const router = Router();
const teamController = container.get<TeamController>(TYPES.TeamController);

router.get("/", (req, res, next) => teamController.getAll(req, res, next));
router.get("/:id", (req, res, next) => teamController.getById(req, res, next));
router.post("/", validateCreateTeam, (req, res, next) => teamController.create(req, res, next));

export default router;
