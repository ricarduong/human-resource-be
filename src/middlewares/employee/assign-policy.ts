import { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../errors/AppError";

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

export function assignPolicy(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { policyId, startDate, endDate, priority } = req.body as Record<string, unknown>;

  if (!isPositiveInteger(policyId)) {
    return next(new ValidationError("'policyId' is required and must be a positive integer"));
  }

  if (!isValidDate(startDate)) {
    return next(new ValidationError("'startDate' is required and must be a valid date"));
  }

  if (endDate !== undefined && endDate !== null && !isValidDate(endDate)) {
    return next(new ValidationError("'endDate' must be a valid date when provided"));
  }

  if (!isPositiveInteger(priority)) {
    return next(new ValidationError("'priority' is required and must be a positive integer"));
  }

  // Convert string dates to Date objects
  req.body.startDate = new Date(startDate as string);
  if (endDate) {
    req.body.endDate = new Date(endDate as string);
  }

  next();
}
