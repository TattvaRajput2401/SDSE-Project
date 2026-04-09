import { createLogger, format, transports } from "winston";

class LoggerService {
  private readonly logger = createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.printf(({ timestamp, level, message, stack }) => {
        if (stack) return `${timestamp} [${level}] ${message}\n${stack}`;
        return `${timestamp} [${level}] ${message}`;
      })
    ),
    transports: [new transports.Console()],
  });

  public info(message: string): void {
    this.logger.info(message);
  }

  public warn(message: string): void {
    this.logger.warn(message);
  }

  public error(message: string, stack?: string): void {
    this.logger.error(message, { stack });
  }
}

export const logger = new LoggerService();
