import { Request, Response, NextFunction } from "express";
import { Status } from "@prisma/client";
import { ValidationError } from "../../errors/AppError";

const VALID_STATUSES: Status[] = ["ACTIVE", "INACTIVE"];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function update(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const id = parseInt(req.params["id"] as string, 10);
  if (Number.isNaN(id) || id <= 0) {
    return next(new ValidationError("'id' must be a positive integer"));
  }

  const {
    policyName,
    baseHours,
    coreTimeStart,
    coreTimeEnd,
    updatedBy,
    isDefault,
    status,
  } = req.body as Record<string, unknown>;

  if (
    policyName === undefined &&
    baseHours === undefined &&
    coreTimeStart === undefined &&
    coreTimeEnd === undefined &&
    isDefault === undefined &&
    status === undefined
  ) {
    return next(new ValidationError("At least one updatable policy field must be provided"));
  }

  if (policyName !== undefined && !isNonEmptyString(policyName)) {
    return next(new ValidationError("'policyName' must be a non-empty string when provided"));
  }

  if (baseHours !== undefined && (typeof baseHours !== "number" || !Number.isFinite(baseHours))) {
    return next(new ValidationError("'baseHours' must be a valid number when provided"));
  }

  if (coreTimeStart !== undefined && (!isNonEmptyString(coreTimeStart) || !TIME_PATTERN.test(coreTimeStart))) {
    return next(new ValidationError("'coreTimeStart' must be in HH:mm format when provided"));
  }

  if (coreTimeEnd !== undefined && (!isNonEmptyString(coreTimeEnd) || !TIME_PATTERN.test(coreTimeEnd))) {
    return next(new ValidationError("'coreTimeEnd' must be in HH:mm format when provided"));
  }

  if (!isNonEmptyString(updatedBy)) {
    return next(new ValidationError("'updatedBy' is required and must be a non-empty string"));
  }

  if (isDefault !== undefined && typeof isDefault !== "boolean") {
    return next(new ValidationError("'isDefault' must be a boolean when provided"));
  }

  if (status !== undefined && (typeof status !== "string" || !VALID_STATUSES.includes(status as Status))) {
    return next(new ValidationError(`'status' must be one of: ${VALID_STATUSES.join(", ")}`));
  }

  next();
}
