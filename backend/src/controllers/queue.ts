import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { RetryPolicy } from '@prisma/client';

const createQueueSchema = z.object({
  name: z.string().min(1),
  projectId: z.string().uuid(),
  priority: z.number().int().optional(),
  concurrencyLimit: z.number().int().min(1).optional(),
  retryPolicy: z.nativeEnum(RetryPolicy).optional(),
  maxRetries: z.number().int().min(0).optional()
});

export class QueueController {
  static async createQueue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = createQueueSchema.parse(req.body);

      const project = await prisma.project.findUnique({ where: { id: data.projectId } });
      if (!project) {
        res.status(404).json({ success: false, message: 'Project not found' });
        return;
      }

      const queue = await prisma.queue.create({
        data
      });

      res.status(201).json({ success: true, data: queue });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: 'Validation failed', errors: (error as any).errors });
        return;
      }
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async listQueues(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const queues = await prisma.queue.findMany({
        where: projectId ? { projectId: String(projectId) } : undefined,
        orderBy: { priority: 'desc' }
      });
      res.json({ success: true, data: queues });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getQueue(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const queue = await prisma.queue.findUnique({
        where: { id },
        include: {
          _count: {
            select: { jobs: true }
          }
        }
      });
      if (!queue) {
        res.status(404).json({ success: false, message: 'Queue not found' });
        return;
      }
      res.json({ success: true, data: queue });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
