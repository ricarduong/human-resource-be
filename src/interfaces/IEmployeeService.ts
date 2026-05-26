import { Employee, EmployeePolicy } from "@prisma/client";
import { CreateEmployeeDto, UpdateEmployeeDto, AssignPolicyToEmployeeDto } from "../dtos/employee.dto";
import { PaginatedResult } from "./IEmployeeRepository";

export interface IEmployeeService {
  getAllEmployees(page: number, limit: number): Promise<PaginatedResult<Employee>>;
  getEmployeeById(id: number): Promise<Employee>;
  createEmployee(data: CreateEmployeeDto): Promise<Employee>;
  updateEmployee(id: number, data: UpdateEmployeeDto): Promise<Employee>;
  deleteEmployee(id: number): Promise<Employee>;
  assignPolicyToEmployee(employeeId: number, data: AssignPolicyToEmployeeDto): Promise<EmployeePolicy>;
}
