import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { logger } from './utils/logger';

import { startCronScheduler } from './scheduler/cron';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`API Server running on port ${PORT}`);
  startCronScheduler();
});
