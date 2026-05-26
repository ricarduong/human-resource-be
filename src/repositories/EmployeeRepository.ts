import { inject, injectable } from "inversify";
import { Employee, EmployeePolicy, PrismaClient } from "@prisma/client";
import { IEmployeeRepository, PaginatedResult } from "../interfaces/IEmployeeRepository";
import { CreateEmployeeDto, UpdateEmployeeDto, AssignPolicyToEmployeeDto } from "../dtos/employee.dto";
import { TYPES } from "../constants/types";

@injectable()
export class EmployeeRepository implements IEmployeeRepository {
  private prisma: PrismaClient;

  constructor(@inject(TYPES.PrismaClient) prisma: PrismaClient) {
    this.prisma = prisma;
  }
  public async findAll(page: number, limit: number): Promise<PaginatedResult<Employee>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          createdBy: true,
          updatedAt: true,
          updatedBy: true,
        },
      }),
      this.prisma.employee.count(),
    ]);

    return { data: data as Employee[], total, page, limit };
  }

  public async findById(id: number): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
    }) as Promise<Employee | null>;
  }

  public async findByEmail(email: string): Promise<Employee | null> {
    return this.prisma.employee.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
    }) as Promise<Employee | null>;
  }

  public async create(data: CreateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.create({
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
    }) as Promise<Employee>;
  }

  public async update(id: number, data: UpdateEmployeeDto): Promise<Employee> {
    return this.prisma.employee.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
    }) as Promise<Employee>;
  }

  public async delete(id: number): Promise<Employee> {
    return this.prisma.employee.delete({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        createdBy: true,
        updatedAt: true,
        updatedBy: true,
      },
    }) as Promise<Employee>;
  }

  public async findPolicyAssignmentWithSamePriority(
    employeeId: number,
    priority: number,
    startDate: Date,
    endDate: Date | null
  ): Promise<EmployeePolicy | null> {
    // Check for overlapping time periods with the same priority
    // Overlap occurs when:
    // - existing.startDate <= new.endDate (or new.endDate is null)
    // - AND (existing.endDate is null OR existing.endDate >= new.startDate)
    
    if (endDate === null) {
      // New assignment has no end date, check from startDate onwards
      return this.prisma.employeePolicy.findFirst({
        where: {
          employeeId,
          priority,
          OR: [
            { endDate: null },
            { endDate: { gte: startDate } }
          ]
        }
      });
    } else {
      // New assignment has an end date, check for overlap
      return this.prisma.employeePolicy.findFirst({
        where: {
          employeeId,
          priority,
          startDate: { lte: endDate },
          OR: [
            { endDate: null },
            { endDate: { gte: startDate } }
          ]
        }
      });
    }
  }

  public async findPolicyAssignmentWithNullEndDate(employeeId: number): Promise<EmployeePolicy | null> {
    return this.prisma.employeePolicy.findFirst({
      where: {
        employeeId,
        endDate: null
      }
    });
  }

  public async assignPolicyToEmployee(
    employeeId: number,
    data: AssignPolicyToEmployeeDto
  ): Promise<EmployeePolicy> {
    return this.prisma.employeePolicy.create({
      data: {
        employeeId,
        policyId: data.policyId,
        startDate: data.startDate,
        endDate: data.endDate,
        priority: data.priority
      }
    });
  }
}
