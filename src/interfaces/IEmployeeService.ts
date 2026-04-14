import { Employee } from "@prisma/client";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/employee.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface IEmployeeService {
  getAllEmployees(page: number, limit: number): Promise<PaginatedResult<Employee>>;
  getEmployeeById(id: number): Promise<Employee>;
  createEmployee(data: CreateEmployeeDto): Promise<Employee>;
  updateEmployee(id: number, data: UpdateEmployeeDto): Promise<Employee>;
  deleteEmployee(id: number): Promise<Employee>;
}
