import { CreatePolicyDto } from "../dtos/policy.dto";

export interface IPolicyValidator {
  validateCreate(data: CreatePolicyDto): void;
}
