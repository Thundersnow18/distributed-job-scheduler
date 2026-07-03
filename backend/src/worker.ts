import dotenv from 'dotenv';
dotenv.config();
import { v4 as uuidv4 } from 'uuid';
import { WorkerHeartbeat } from './workers/heartbeat';
import { JobClaimer } from './workers/jobClaimer';
import { JobProcessor } from './workers/jobProcessor';
import { logger } from './utils/logger';

const WORKER_ID = `worker-${uuidv4()}`;
let isShuttingDown = false;

async function runWorker() {
  logger.info(`Starting worker ${WORKER_ID}`);
  
  const heartbeat = new WorkerHeartbeat(WORKER_ID);
  await heartbeat.start();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Graceful shutdown initiated...');
    isShuttingDown = true;
    await heartbeat.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Graceful shutdown initiated...');
    isShuttingDown = true;
    await heartbeat.stop();
    process.exit(0);
  });

  // Polling loop
  while (!isShuttingDown) {
    try {
      const job = await JobClaimer.claimNextJob(WORKER_ID);
      
      if (job) {
        await JobProcessor.processJob(job);
      } else {
        // No jobs, sleep briefly to prevent tight loop
        await new Promise(res => setTimeout(res, 2000));
      }
    } catch (error) {
      logger.error('Worker loop error', { error });
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

runWorker().catch(error => {
  logger.error('Fatal worker error', { error });
  process.exit(1);
});
