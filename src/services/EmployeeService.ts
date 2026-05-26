import { injectable, inject } from "inversify";
import { Employee, EmployeePolicy } from "@prisma/client";
import { IEmployeeService } from "../interfaces/IEmployeeService";
import { IEmployeeRepository, PaginatedResult } from "../interfaces/IEmployeeRepository";
import { IPolicyRepository } from "../interfaces/IPolicyRepository";
import { CreateEmployeeDto, UpdateEmployeeDto, AssignPolicyToEmployeeDto } from "../dtos/employee.dto";
import { TYPES } from "../constants/types";
import { Logger } from "../utils/Logger";
import { NotFoundError, ConflictError, ValidationError } from "../errors/AppError";

const logger = new Logger("EmployeeService");

@injectable()
export class EmployeeService implements IEmployeeService {
  constructor(
    @inject(TYPES.EmployeeRepository) private employeeRepository: IEmployeeRepository,
    @inject(TYPES.PolicyRepository) private policyRepository: IPolicyRepository
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

  async assignPolicyToEmployee(employeeId: number, data: AssignPolicyToEmployeeDto): Promise<EmployeePolicy> {
    logger.info("Assigning policy to employee", { employeeId, policyId: data.policyId });
    try {
      // Validate employee exists
      const employee = await this.employeeRepository.findById(employeeId);
      if (!employee) {
        throw new NotFoundError(`Employee with id ${employeeId} not found`);
      }

      // Validate policy exists
      const policy = await this.policyRepository.findById(data.policyId);
      if (!policy) {
        throw new NotFoundError(`Policy with id ${data.policyId} not found`);
      }

      // Business Rule 1: startDate must be less than endDate (when endDate is provided)
      if (data.endDate && data.startDate >= data.endDate) {
        throw new ValidationError("startDate must be before endDate");
      }

      // Business Rule 2: Only one policy assignment can have null endDate
      if (data.endDate === null || data.endDate === undefined) {
        const existingNullEndDate = await this.employeeRepository.findPolicyAssignmentWithNullEndDate(employeeId);
        if (existingNullEndDate) {
          throw new ConflictError("Employee already has a policy assignment with no end date");
        }
      }

      // Business Rule 3: No two policies with the same priority during overlapping time periods
      const existingSamePriority = await this.employeeRepository.findPolicyAssignmentWithSamePriority(
        employeeId,
        data.priority,
        data.startDate,
        data.endDate ?? null
      );
      if (existingSamePriority) {
        throw new ConflictError(`Policy with priority ${data.priority} is already assigned during the specified time period`);
      }

      // Create the policy assignment
      const assignment = await this.employeeRepository.assignPolicyToEmployee(employeeId, data);
      logger.info("Assigned policy to employee", { assignmentId: assignment.id });
      return assignment;
    } catch (error) {
      logger.error("Failed to assign policy to employee", error);
      throw error;
    }
  }
}
