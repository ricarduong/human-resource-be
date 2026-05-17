import { CreatePolicyDto, PolicyDto } from "../dtos/policy.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface IPolicyRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<PolicyDto>>;
  findByPolicyName(policyName: string): Promise<PolicyDto | null>;
  create(data: CreatePolicyDto): Promise<PolicyDto>;
}
