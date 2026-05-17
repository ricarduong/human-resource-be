import { PolicyDto } from "../dtos/policy.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface IPolicyRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<PolicyDto>>;
}
