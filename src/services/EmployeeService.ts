import { injectable, inject } from "inversify";
import { Employee } from "@prisma/client";
import { IEmployeeService } from "../interfaces/IEmployeeService";
import { IEmployeeRepository, PaginatedResult } from "../interfaces/IEmployeeRepository";
import { TYPES } from "../constants/types";
import { Logger } from "../utils/Logger";

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
}
