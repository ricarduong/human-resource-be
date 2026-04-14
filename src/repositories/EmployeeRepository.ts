import { inject, injectable } from "inversify";
import { Employee, PrismaClient } from "@prisma/client";
import { IEmployeeRepository, PaginatedResult } from "../interfaces/IEmployeeRepository";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/employee.dto";
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
          department: true,
          createdAt: true,
          updatedAt: true,
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
        department: true,
        createdAt: true,
        updatedAt: true,
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
        department: true,
        createdAt: true,
        updatedAt: true,
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
        department: true,
        createdAt: true,
        updatedAt: true,
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
        department: true,
        createdAt: true,
        updatedAt: true,
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
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as Promise<Employee>;
  }
}
