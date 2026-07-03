import cron from 'node-cron';
import prisma from '../prisma/client';
import { logger } from '../utils/logger';

export const startCronScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    logger.info('Running cron scheduler to check for recurring jobs...');
    
    try {
      const recurringJobs = await prisma.job.findMany({
        where: {
          cronExpression: { not: null },
          status: { in: ['COMPLETED', 'FAILED'] }
        }
      });
      
      if (recurringJobs.length > 0) {
        logger.info(`Found ${recurringJobs.length} recurring jobs. Evaluating schedules...`);
      }
    } catch (error) {
      logger.error('Error in cron scheduler', { error });
    }
  });
};
