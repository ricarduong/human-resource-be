import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { IUserService } from "../interfaces/IUserService";
import { TYPES } from "../constants/types";
import { UpdateUserDto } from "../dtos/user.dto";

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.UserService) private userService: IUserService
  ) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query["page"] as string) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query["limit"] as string) || 20));
      const result = await this.userService.getAllUsers(page, limit);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getByEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.params["email"] as string;
      const user = await this.userService.getUserByEmail(email);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string, 10);
      const dto = req.body as UpdateUserDto;
      const updated = await this.userService.updateUser(id, dto);
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params["id"] as string, 10);
      await this.userService.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
