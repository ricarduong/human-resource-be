import { injectable, inject } from "inversify";
import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/IAuthService";
import { TYPES } from "../constants/types";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private authService: IAuthService
  ) {}

  async googleLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await this.authService.googleLogin(req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
