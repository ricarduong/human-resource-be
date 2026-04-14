import { Employee } from "@prisma/client";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/employee.dto";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IEmployeeRepository {
  findAll(page: number, limit: number): Promise<PaginatedResult<Employee>>;
  findById(id: number): Promise<Employee | null>;
  findByEmail(email: string): Promise<Employee | null>;
  create(data: CreateEmployeeDto): Promise<Employee>;
  update(id: number, data: UpdateEmployeeDto): Promise<Employee>;
  delete(id: number): Promise<Employee>;
}
