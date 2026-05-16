import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { ITeamService } from "../interfaces/ITeamService";
import { TYPES } from "../constants/types";
import { CreateTeamDto } from "../dtos/team.dto";

@injectable()
export class TeamController {
  constructor(
    @inject(TYPES.TeamService) private teamService: ITeamService
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
      const result = await this.teamService.getAllTeams(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string, 10);
      const team = await this.teamService.getTeamById(id);
      res.status(200).json(team);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreateTeamDto;
      const team = await this.teamService.createTeam(dto);
      res.status(201).json(team);
    } catch (error) {
      next(error);
    }
  }
}
