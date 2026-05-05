import pino, { Logger as PinoLogger } from "pino";

const isTest = process.env.NODE_ENV === "test";
const isDevelopment = process.env.NODE_ENV !== "production";

const logger: PinoLogger = pino({
  enabled: !isTest,
  level: process.env.LOG_LEVEL ?? "info",
  transport: isDevelopment && !isTest
    ? { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:standard" } }
    : undefined,
});

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, data?: object): void {
    logger.info({ context: this.context, ...data }, message);
  }

  warn(message: string, data?: object): void {
    logger.warn({ context: this.context, ...data }, message);
  }

  error(message: string, error?: unknown): void {
    logger.error({ context: this.context, err: error }, message);
  }

  debug(message: string, data?: object): void {
    logger.debug({ context: this.context, ...data }, message);
  }
}
