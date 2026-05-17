import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../errors/AppError";

export function id(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const userId = parseInt(req.params["id"] as string, 10);
  if (Number.isNaN(userId) || userId <= 0) {
    return next(new ValidationError("'id' must be a positive integer"));
  }

  next();
}
