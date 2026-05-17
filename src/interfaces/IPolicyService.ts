import { CreatePolicyDto, PolicyDto } from "../dtos/policy.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface IPolicyService {
  getAllPolicies(page: number, limit: number): Promise<PaginatedResult<PolicyDto>>;
  createPolicy(data: CreatePolicyDto): Promise<PolicyDto>;
}
