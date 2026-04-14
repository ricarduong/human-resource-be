import { injectable, inject } from "inversify";
import { Employee } from "@prisma/client";
import { IEmployeeService } from "../interfaces/IEmployeeService";
import { IEmployeeRepository, PaginatedResult } from "../interfaces/IEmployeeRepository";
import { CreateEmployeeDto, UpdateEmployeeDto } from "../dtos/employee.dto";
import { TYPES } from "../constants/types";
import { Logger } from "../utils/Logger";
import { NotFoundError, ConflictError } from "../errors/AppError";

const logger = new Logger("EmployeeService");

@injectable()
export class EmployeeService implements IEmployeeService {
  constructor(
    @inject(TYPES.EmployeeRepository) private employeeRepository: IEmployeeRepository
  ) {}

  async getAllEmployees(page: number, limit: number): Promise<PaginatedResult<Employee>> {
    logger.info("Fetching all employees", { page, limit });
    try {
      const result = await this.employeeRepository.findAll(page, limit);
      logger.info("Fetched all employees", { count: result.data.length, total: result.total });
      return result;
    } catch (error) {
      logger.error("Failed to fetch employees", error);
      throw error;
    }
  }

  async getEmployeeById(id: number): Promise<Employee> {
    logger.info("Fetching employee by id", { id });
    try {
      const employee = await this.employeeRepository.findById(id);
      if (!employee) {
        throw new NotFoundError(`Employee with id ${id} not found`);
      }
      logger.info("Fetched employee", { id });
      return employee;
    } catch (error) {
      logger.error("Failed to fetch employee", error);
      throw error;
    }
  }

  async createEmployee(data: CreateEmployeeDto): Promise<Employee> {
    logger.info("Creating employee", { email: data.email });
    try {
      const existing = await this.employeeRepository.findByEmail(data.email);
      if (existing) {
        throw new ConflictError(`Employee with email ${data.email} already exists`);
      }
      const employee = await this.employeeRepository.create(data);
      logger.info("Created employee", { id: employee.id });
      return employee;
    } catch (error) {
      logger.error("Failed to create employee", error);
      throw error;
    }
  }

  async updateEmployee(id: number, data: UpdateEmployeeDto): Promise<Employee> {
    logger.info("Updating employee", { id });
    try {
      const existing = await this.employeeRepository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Employee with id ${id} not found`);
      }
      if (data.email && data.email !== existing.email) {
        const emailTaken = await this.employeeRepository.findByEmail(data.email);
        if (emailTaken) {
          throw new ConflictError(`Employee with email ${data.email} already exists`);
        }
      }
      const employee = await this.employeeRepository.update(id, data);
      logger.info("Updated employee", { id });
      return employee;
    } catch (error) {
      logger.error("Failed to update employee", error);
      throw error;
    }
  }

  async deleteEmployee(id: number): Promise<Employee> {
    logger.info("Deleting employee", { id });
    try {
      const existing = await this.employeeRepository.findById(id);
      if (!existing) {
        throw new NotFoundError(`Employee with id ${id} not found`);
      }
      const employee = await this.employeeRepository.delete(id);
      logger.info("Deleted employee", { id });
      return employee;
    } catch (error) {
      logger.error("Failed to delete employee", error);
      throw error;
    }
  }
}
