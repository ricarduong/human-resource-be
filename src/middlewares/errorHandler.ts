import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/Logger";

const logger = new Logger("ErrorHandler");

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.headers["x-request-id"] as string | undefined;

  if (err instanceof AppError) {
    logger.warn(err.message, { requestId, statusCode: err.statusCode });
    res.status(err.statusCode).json({ error: err.message, requestId });
    return;
  }

  logger.error("Unhandled error", err);
  res.status(500).json({ error: "Internal Server Error", requestId });
}

