import { CreateTeamDto, TeamDto } from "../dtos/team.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface ITeamService {
  getAllTeams(page: number, limit: number): Promise<PaginatedResult<TeamDto>>;
  getTeamById(id: number): Promise<TeamDto>;
  createTeam(data: CreateTeamDto): Promise<TeamDto>;
}
