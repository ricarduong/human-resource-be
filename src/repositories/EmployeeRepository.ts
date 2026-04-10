import { injectable, inject } from "inversify";
import { PrismaClient, Employee } from "@prisma/client";
import { IEmployeeRepository, PaginatedResult } from "../interfaces/IEmployeeRepository";
import { TYPES } from "../constants/types";

@injectable()
export class EmployeeRepository implements IEmployeeRepository {
  constructor(@inject(TYPES.PrismaClient) private prisma: PrismaClient) {}

  async findAll(page: number, limit: number): Promise<PaginatedResult<Employee>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.employee.findMany({ skip, take: limit }),
      this.prisma.employee.count(),
    ]);
    return { data, total, page, limit };
  }
}
