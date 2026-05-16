import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import { PolicyDto } from "../dtos/policy.dto";
import { IPolicyRepository } from "../interfaces/IPolicyRepository";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { TYPES } from "../constants/types";

@injectable()
export class PolicyRepository implements IPolicyRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
  }

  public async findAll(page: number, limit: number): Promise<PaginatedResult<PolicyDto>> {
    const skip = (page - 1) * limit;

    const [policies, total] = await this.prisma.$transaction([
      this.prisma.policy.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          policy_name: true,
          base_hours: true,
          core_time_start: true,
          core_time_end: true,
          is_default: true,
          status: true,
          createdAt: true,
          createdBy: true,
          updatedAt: true,
          updatedBy: true,
        },
      }),
      this.prisma.policy.count(),
    ]);

    return {
      data: policies.map((policy) => ({
        id: policy.id,
        policyName: policy.policy_name,
        baseHours: policy.base_hours,
        coreTimeStart: policy.core_time_start,
        coreTimeEnd: policy.core_time_end,
        isDefault: policy.is_default,
        status: policy.status,
        createdAt: policy.createdAt,
        createdBy: policy.createdBy,
        updatedAt: policy.updatedAt,
        updatedBy: policy.updatedBy,
      })),
      total,
      page,
      limit,
    };
  }
}