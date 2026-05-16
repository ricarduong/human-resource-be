import { inject, injectable } from "inversify";
import { TYPES } from "../constants/types";
import { PolicyDto } from "../dtos/policy.dto";
import { IPolicyRepository } from "../interfaces/IPolicyRepository";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { IPolicyService } from "../interfaces/IPolicyService";
import { Logger } from "../utils/Logger";

const logger = new Logger("PolicyService");

@injectable()
export class PolicyService implements IPolicyService {
  constructor(
    @inject(TYPES.PolicyRepository) private policyRepository: IPolicyRepository
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
}
