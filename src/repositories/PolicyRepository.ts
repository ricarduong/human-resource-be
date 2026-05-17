import { PrismaClient } from "@prisma/client";
import { inject, injectable } from "inversify";
import { CreatePolicyDto, PolicyDto, UpdatePolicyDto } from "../dtos/policy.dto";
import { IPolicyRepository } from "../interfaces/IPolicyRepository";
import { PaginatedResult } from "../interfaces/IEmployeeRepository";
import { TYPES } from "../constants/types";

@injectable()
export class PolicyRepository implements IPolicyRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
  }

  private toPolicyDto(policy: {
    id: number;
    policy_name: string;
    base_hours: number;
    core_time_start: string;
    core_time_end: string;
    is_default: boolean;
    status: PolicyDto["status"];
    createdAt: Date;
    createdBy: string;
    updatedAt: Date | null;
    updatedBy: string | null;
  }): PolicyDto {
    return {
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
    };
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
      data: policies.map((policy) => this.toPolicyDto(policy)),
      total,
      page,
      limit,
    };
  }

  public async findById(id: number): Promise<PolicyDto | null> {
    const policy = await this.prisma.policy.findUnique({
      where: { id },
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
    });

    return policy ? this.toPolicyDto(policy) : null;
  }

  public async findByPolicyName(policyName: string): Promise<PolicyDto | null> {
    const policy = await this.prisma.policy.findFirst({
      where: { policy_name: policyName },
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
    });

    return policy ? this.toPolicyDto(policy) : null;
  }

  public async create(data: CreatePolicyDto): Promise<PolicyDto> {
    const policy = await this.prisma.policy.create({
      data: {
        policy_name: data.policyName,
        base_hours: data.baseHours,
        core_time_start: data.coreTimeStart,
        core_time_end: data.coreTimeEnd,
        createdBy: data.createdBy,
        is_default: data.isDefault,
        status: data.status,
      },
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
    });

    return this.toPolicyDto(policy);
  }

  public async update(id: number, data: UpdatePolicyDto): Promise<PolicyDto> {
    const policy = await this.prisma.policy.update({
      where: { id },
      data: {
        ...(data.policyName !== undefined ? { policy_name: data.policyName } : {}),
        ...(data.baseHours !== undefined ? { base_hours: data.baseHours } : {}),
        ...(data.coreTimeStart !== undefined ? { core_time_start: data.coreTimeStart } : {}),
        ...(data.coreTimeEnd !== undefined ? { core_time_end: data.coreTimeEnd } : {}),
        ...(data.isDefault !== undefined ? { is_default: data.isDefault } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        updatedBy: data.updatedBy,
      },
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
    });

    return this.toPolicyDto(policy);
  }
}