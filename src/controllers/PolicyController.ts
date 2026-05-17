import { Request, Response, NextFunction } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "../constants/types";
import { IPolicyService } from "../interfaces/IPolicyService";
import { CreatePolicyDto } from "../dtos/policy.dto";

@injectable()
export class PolicyController {
  constructor(
    @inject(TYPES.PolicyService) private policyService: IPolicyService
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
      const result = await this.policyService.getAllPolicies(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = req.body as CreatePolicyDto;
      const policy = await this.policyService.createPolicy(dto);
      res.status(201).json(policy);
    } catch (error) {
      next(error);
    }
  }
}
