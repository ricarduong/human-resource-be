import { Employee } from "@prisma/client";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IEmployeeRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<Employee>>;
}
