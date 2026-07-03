import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { JobStatus } from '@prisma/client';

const createJobSchema = z.object({
  queueId: z.string().uuid(),
  payload: z.record(z.any()),
  priority: z.number().int().optional(),
  runAt: z.string().datetime().optional(), // ISO string
  cronExpression: z.string().optional()
});

export class JobController {
  static async createJob(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = createJobSchema.parse(req.body);

      const queue = await prisma.queue.findUnique({ where: { id: data.queueId } });
      if (!queue) {
        res.status(404).json({ success: false, message: 'Queue not found' });
        return;
      }

      let initialStatus = JobStatus.QUEUED;
      if (data.runAt || data.cronExpression) {
        initialStatus = JobStatus.SCHEDULED;
      }

      const job = await prisma.job.create({
        data: {
          queueId: data.queueId,
          payload: data.payload,
          priority: data.priority ?? queue.priority,
          status: initialStatus,
          runAt: data.runAt ? new Date(data.runAt) : null,
          cronExpression: data.cronExpression
        }
      });

      res.status(201).json({ success: true, data: job });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: error.errors });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async listJobs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { queueId, status, page = 1, limit = 10 } = req.query;
      
      const pageNum = Number(page);
      const limitNum = Number(limit);

      const where: any = {};
      if (queueId) where.queueId = String(queueId);
      if (status) where.status = status;

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          take: limitNum,
          skip: (pageNum - 1) * limitNum,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.job.count({ where })
      ]);

      res.json({
        success: true,
        data: jobs,
        meta: { total, page: pageNum, limit: limitNum }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
