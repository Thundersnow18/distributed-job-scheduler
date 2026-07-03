import os from 'os';
import prisma from '../prisma/client';
import { logger } from '../utils/logger';

export class WorkerHeartbeat {
  private workerId: string;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(workerId: string) {
    this.workerId = workerId;
  }

  async start() {
    await prisma.worker.upsert({
      where: { id: this.workerId },
      update: { status: 'ACTIVE', lastHeartbeat: new Date() },
      create: {
        id: this.workerId,
        hostname: os.hostname(),
        status: 'ACTIVE'
      }
    });

    this.intervalId = setInterval(async () => {
      try {
        await prisma.worker.update({
          where: { id: this.workerId },
          data: { lastHeartbeat: new Date(), status: 'ACTIVE' }
        });
        
        await prisma.workerHeartbeat.create({
          data: {
            workerId: this.workerId,
            loadMetrics: {
              freemem: os.freemem(),
              totalmem: os.totalmem(),
              loadavg: os.loadavg()
            }
          }
        });
      } catch (error) {
        logger.error('Failed to send heartbeat', { error });
      }
    }, 15000); // 15 seconds
  }

  async stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    try {
      await prisma.worker.update({
        where: { id: this.workerId },
        data: { status: 'DEAD' }
      });
    } catch (error) {
      logger.error('Failed to mark worker dead on stop', { error });
    }
  }
}
