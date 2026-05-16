import { CreateTeamDto, TeamDto } from "../dtos/team.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface ITeamRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<TeamDto>>;
  findById(id: number): Promise<TeamDto | null>;
  findByCode(code: string): Promise<TeamDto | null>;
  create(data: CreateTeamDto): Promise<TeamDto>;
}
