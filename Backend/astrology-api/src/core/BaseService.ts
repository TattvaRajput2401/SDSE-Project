import { logger } from "../utils/logger";

export abstract class BaseService {
  protected abstract readonly serviceName: string;

  protected logInfo(message: string): void {
    logger.info(`[${this.serviceName}] ${message}`);
  }

  protected logError(message: string, stack?: string): void {
    logger.error(`[${this.serviceName}] ${message}`, stack);
  }
}
