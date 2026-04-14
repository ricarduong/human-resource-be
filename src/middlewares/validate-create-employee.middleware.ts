import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates the request body for POST /employee.
 * Required fields: email (valid format), name, department.
 * Optional field: role (must be a string when provided).
 * Throws ValidationError (400) for any violation — caught by errorHandler.
 */
export function validateCreateEmployee(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { email, name, role, department } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(name)) {
    return next(new ValidationError("'name' is required and must be a non-empty string"));
  }

  if (!isNonEmptyString(email)) {
    return next(new ValidationError("'email' is required and must be a non-empty string"));
  }

  if (!EMAIL_REGEX.test(email)) {
    return next(new ValidationError("'email' must be a valid email address"));
  }

  if (!isNonEmptyString(department)) {
    return next(new ValidationError("'department' is required and must be a non-empty string"));
  }

  if (role !== undefined && !isNonEmptyString(role)) {
    return next(new ValidationError("'role' must be a non-empty string when provided"));
  }

  next();
}
