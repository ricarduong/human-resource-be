import { CreatePolicyDto, UpdatePolicyDto } from "../dtos/policy.dto";

export interface IPolicyValidator {
  validateCreate(data: CreatePolicyDto): void;
  validateUpdate(data: UpdatePolicyDto): void;
}
