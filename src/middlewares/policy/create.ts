import { Request, Response, NextFunction } from "express";
import { Status } from "@prisma/client";
import { ValidationError } from "../../errors/AppError";

const VALID_STATUSES: Status[] = ["ACTIVE", "INACTIVE"];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function create(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const {
    policyName,
    baseHours,
    coreTimeStart,
    coreTimeEnd,
    createdBy,
    isDefault,
    status,
  } = req.body as Record<string, unknown>;

  if (!isNonEmptyString(policyName)) {
    return next(new ValidationError("'policyName' is required and must be a non-empty string"));
  }

  if (typeof baseHours !== "number" || !Number.isFinite(baseHours)) {
    return next(new ValidationError("'baseHours' is required and must be a valid number"));
  }

  if (!isNonEmptyString(coreTimeStart) || !TIME_PATTERN.test(coreTimeStart)) {
    return next(new ValidationError("'coreTimeStart' is required and must be in HH:mm format"));
  }

  if (!isNonEmptyString(coreTimeEnd) || !TIME_PATTERN.test(coreTimeEnd)) {
    return next(new ValidationError("'coreTimeEnd' is required and must be in HH:mm format"));
  }

  if (!isNonEmptyString(createdBy)) {
    return next(new ValidationError("'createdBy' is required and must be a non-empty string"));
  }

  if (isDefault !== undefined && typeof isDefault !== "boolean") {
    return next(new ValidationError("'isDefault' must be a boolean when provided"));
  }

  if (status !== undefined && (typeof status !== "string" || !VALID_STATUSES.includes(status as Status))) {
    return next(new ValidationError(`'status' must be one of: ${VALID_STATUSES.join(", ")}`));
  }

  next();
}
