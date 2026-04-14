import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { IEmployeeService } from "../interfaces/IEmployeeService";
import { TYPES } from "../constants/types";

@injectable()
export class EmployeeController {
  constructor(
    @inject(TYPES.EmployeeService) private employeeService: IEmployeeService
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
      const result = await this.employeeService.getAllEmployees(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const employee = await this.employeeService.getEmployeeById(id);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await this.employeeService.createEmployee(req.body);
      res.status(201).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const employee = await this.employeeService.updateEmployee(id, req.body);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string);
      const employee = await this.employeeService.deleteEmployee(id);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }
}
