import { CreatePolicyDto, PolicyDto, UpdatePolicyDto } from "../dtos/policy.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface IPolicyRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<PolicyDto>>;
  findById(id: number): Promise<PolicyDto | null>;
  findByPolicyName(policyName: string): Promise<PolicyDto | null>;
  create(data: CreatePolicyDto): Promise<PolicyDto>;
  update(id: number, data: UpdatePolicyDto): Promise<PolicyDto>;
}
