import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateCreateTeam(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { code, name } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(code)) {
    return next(new ValidationError("'code' is required and must be a non-empty string"));
  }

  if (!isNonEmptyString(name)) {
    return next(new ValidationError("'name' is required and must be a non-empty string"));
  }

  next();
}