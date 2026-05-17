import { inject, injectable } from "inversify";
import { TYPES } from "../constants/types";
import { CreatePolicyDto, PolicyDto, UpdatePolicyDto } from "../dtos/policy.dto";
import { IPolicyRepository } from "../interfaces/IPolicyRepository";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { IPolicyService } from "../interfaces/IPolicyService";
import { IPolicyValidator } from "../interfaces/IPolicyValidator";
import { Logger } from "../utils/Logger";
import { ConflictError, NotFoundError } from "../errors/AppError";

const logger = new Logger("PolicyService");

@injectable()
export class PolicyService implements IPolicyService {
  constructor(
    @inject(TYPES.PolicyRepository) private policyRepository: IPolicyRepository,
    @inject(TYPES.PolicyValidator) private policyValidator: IPolicyValidator
  ) {}

  async getAllPolicies(page: number, limit: number): Promise<PaginatedResult<PolicyDto>> {
    logger.info("Fetching all policies", { page, limit });
    try {
      const result = await this.policyRepository.findAll(page, limit);
      logger.info("Fetched all policies", { count: result.data.length, total: result.total });
      return result;
    } catch (error) {
      logger.error("Failed to fetch policies", error);
      throw error;
    }
  }

  async createPolicy(data: CreatePolicyDto): Promise<PolicyDto> {
    logger.info("Creating policy", { policyName: data.policyName });
    this.policyValidator.validateCreate(data);

    try {
      const existing = await this.policyRepository.findByPolicyName(data.policyName);
      if (existing) {
        throw new ConflictError(`Policy with name ${data.policyName} already exists`);
      }

      const policy = await this.policyRepository.create(data);
      logger.info("Created policy", { id: policy.id, policyName: policy.policyName });
      return policy;
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") {
        throw new ConflictError(`Policy with name ${data.policyName} already exists`);
      }

      logger.error("Failed to create policy", error);
      throw error;
    }
  }

  async updatePolicy(id: number, data: UpdatePolicyDto): Promise<PolicyDto> {
    logger.info("Updating policy", { id });
    this.policyValidator.validateUpdate(data);

    try {
      const existing = await this.policyRepository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Policy with id ${id} not found`);
      }

      const mergedPolicy: CreatePolicyDto = {
        policyName: data.policyName ?? existing.policyName,
        baseHours: data.baseHours ?? existing.baseHours,
        coreTimeStart: data.coreTimeStart ?? existing.coreTimeStart,
        coreTimeEnd: data.coreTimeEnd ?? existing.coreTimeEnd,
        createdBy: existing.createdBy,
        isDefault: data.isDefault ?? existing.isDefault,
        status: data.status ?? existing.status,
      };

      this.policyValidator.validateCreate(mergedPolicy);

      if (data.policyName !== undefined) {
        const policyWithSameName = await this.policyRepository.findByPolicyName(data.policyName);
        if (policyWithSameName && policyWithSameName.id !== id) {
          throw new ConflictError(`Policy with name ${data.policyName} already exists`);
        }
      }

      const updatedPolicy = await this.policyRepository.update(id, data);
      logger.info("Updated policy", { id });
      return updatedPolicy;
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError?.code === "P2002") {
        throw new ConflictError(`Policy with name ${data.policyName} already exists`);
      }
      if (prismaError?.code === "P2025") {
        throw new NotFoundError(`Policy with id ${id} not found`);
      }

      logger.error("Failed to update policy", error);
      throw error;
    }
  }
}
