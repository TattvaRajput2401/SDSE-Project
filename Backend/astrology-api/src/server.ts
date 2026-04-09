import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";
import { connectRedis } from "./config/redis";
import { logger } from "./utils/logger";

const PORT = Number(process.env.PORT || 5000);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    await connectRedis();

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown startup error";
    logger.error(`Server startup failed: ${message}`);
    process.exit(1);
  }
};

void startServer();
