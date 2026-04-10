import { Employee } from "@prisma/client";
import { PaginatedResult } from "./IEmployeeRepository";

export interface IEmployeeService {
  getAllEmployees(page: number, limit: number): Promise<PaginatedResult<Employee>>;
}
