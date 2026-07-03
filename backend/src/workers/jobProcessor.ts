import prisma from '../prisma/client';
import { Job, RetryPolicy } from '@prisma/client';
import { logger } from '../utils/logger';

export class JobProcessor {
  static async processJob(job: Job) {
    logger.info(`Starting job ${job.id} from queue ${job.queueId}`);
    
    // Create execution record
    const execution = await prisma.jobExecution.create({
      data: {
        jobId: job.id,
        workerId: job.workerId!,
        status: 'RUNNING',
      }
    });

    await prisma.job.update({
      where: { id: job.id },
      data: { status: 'RUNNING' }
    });

    const startTime = Date.now();
    let success = false;
    let errorMessage = '';

    try {
      const payload = job.payload as any;
      if (payload?.fail) {
        throw new Error('Job execution failed: Target error encountered');
      }
      
      const duration = payload?.duration || 1000;
      await new Promise(res => setTimeout(res, duration));

      success = true;
    } catch (error: any) {
      success = false;
      errorMessage = error.message;
      logger.error(`Job ${job.id} failed`, { error });
    }

    const durationMs = Date.now() - startTime;

    // Finish Execution
    await prisma.jobExecution.update({
      where: { id: execution.id },
      data: {
        status: success ? 'COMPLETED' : 'FAILED',
        completedAt: new Date(),
        error: success ? null : errorMessage,
        metrics: { durationMs }
      }
    });

    if (success) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'COMPLETED' }
      });
      logger.info(`Completed job ${job.id} in ${durationMs}ms`);
    } else {
      await this.handleJobFailure(job, errorMessage);
    }
  }

  private static async handleJobFailure(job: Job, errorMessage: string) {
    const queue = await prisma.queue.findUnique({ where: { id: job.queueId } });
    if (!queue) return;

    if (job.retryCount < queue.maxRetries) {
      // Schedule retry
      let nextRunAt = new Date();
      const delayBase = 1000; // 1 second base

      switch (queue.retryPolicy) {
        case RetryPolicy.FIXED:
          nextRunAt = new Date(Date.now() + 5000); // 5 seconds
          break;
        case RetryPolicy.LINEAR:
          nextRunAt = new Date(Date.now() + (job.retryCount + 1) * 5000);
          break;
        case RetryPolicy.EXPONENTIAL:
          nextRunAt = new Date(Date.now() + Math.pow(2, job.retryCount) * delayBase);
          break;
      }

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: 'SCHEDULED',
          retryCount: { increment: 1 },
          runAt: nextRunAt,
          workerId: null // release worker
        }
      });
      logger.info(`Scheduled job ${job.id} for retry at ${nextRunAt}`);
    } else {
      // Move to DLQ
      await prisma.$transaction([
        prisma.job.update({
          where: { id: job.id },
          data: { status: 'DLQ' }
        }),
        prisma.deadLetterQueue.create({
          data: {
            jobId: job.id,
            reason: errorMessage
          }
        })
      ]);
      logger.warn(`Job ${job.id} moved to DLQ`);
    }
  }
}
