import { injectable, inject } from "inversify";
import { ITeamService } from "../interfaces/ITeamService";
import { ITeamRepository } from "../interfaces/ITeamRepository";
import { CreateTeamDto, TeamDto } from "../dtos/team.dto";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { TYPES } from "../constants/types";
import { Logger } from "../utils/Logger";
import { ConflictError, NotFoundError } from "../errors/AppError";

const logger = new Logger("TeamService");

@injectable()
export class TeamService implements ITeamService {
  constructor(
    @inject(TYPES.TeamRepository) private teamRepository: ITeamRepository
  ) {}

  async getAllTeams(page: number, limit: number): Promise<PaginatedResult<TeamDto>> {
    logger.info("Fetching all teams", { page, limit });
    try {
      const result = await this.teamRepository.findAll(page, limit);
      logger.info("Fetched all teams", { count: result.data.length, total: result.total });
      return result;
    } catch (error) {
      logger.error("Failed to fetch teams", error);
      throw error;
    }
  }

  async getTeamById(id: number): Promise<TeamDto> {
    logger.info("Fetching team by id", { id });
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new NotFoundError(`Team with id ${id} not found`);
    }
    logger.info("Fetched team", { id });
    return team;
  }

  async createTeam(data: CreateTeamDto): Promise<TeamDto> {
    logger.info("Creating team", { code: data.code });
    try {
      const existing = await this.teamRepository.findByCode(data.code);
      if (existing) {
        throw new ConflictError(`Team with code ${data.code} already exists`);
      }

      const team = await this.teamRepository.create(data);
      logger.info("Created team", { id: team.id, code: team.code });
      return team;
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") {
        throw new ConflictError(`Team with code ${data.code} already exists`);
      }

      logger.error("Failed to create team", error);
      throw error;
    }
  }
}
