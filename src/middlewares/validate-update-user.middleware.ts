import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../errors/AppError";

const VALID_ROLES = ["ADMIN", "MANAGER", "STAFF"];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Validates :id param is a positive integer. Used by PATCH and DELETE routes.
 */
export function validateUserId(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id) || id <= 0) {
    return next(new ValidationError("'id' must be a positive integer"));
  }
  next();
}

/**
 * Validates the request body for PATCH /users/:id.
 * At least one of: name, role must be present.
 * id param must be a positive integer.
 */
export function validateUpdateUser(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const id = parseInt(req.params["id"] as string, 10);
  if (isNaN(id) || id <= 0) {
    return next(new ValidationError("'id' must be a positive integer"));
  }

  const { name, role } = req.body as Record<string, unknown>;

  if (name === undefined && role === undefined) {
    return next(new ValidationError("At least one of 'name' or 'role' must be provided"));
  }

  if (name !== undefined && !isNonEmptyString(name)) {
    return next(new ValidationError("'name' must be a non-empty string when provided"));
  }

  if (role !== undefined) {
    if (!isNonEmptyString(role)) {
      return next(new ValidationError("'role' must be a non-empty string when provided"));
    }
    if (!VALID_ROLES.includes(role)) {
      return next(new ValidationError(`'role' must be one of: ${VALID_ROLES.join(", ")}`));
    }
  }

  next();
}
