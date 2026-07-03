import prisma from '../prisma/client';
import { Job } from '@prisma/client';
import { logger } from '../utils/logger';

export class JobClaimer {
  /**
   * Atomically claims the next available job using PostgreSQL SKIP LOCKED.
   * Prevents race conditions and ensures a job is only executed once.
   */
  static async claimNextJob(workerId: string, queueIds: string[] = []): Promise<Job | null> {
    try {
      const queueCondition = queueIds.length > 0 
        ? `AND "queueId" IN (${queueIds.map(id => `'${id}'`).join(',')})` 
        : '';

      const query = `
        WITH next_job AS (
          SELECT id
          FROM "Job"
          WHERE (status = 'QUEUED' OR (status = 'SCHEDULED' AND "runAt" <= NOW()))
          ${queueCondition}
          ORDER BY priority DESC, "createdAt" ASC
          LIMIT 1
          FOR UPDATE SKIP LOCKED
        )
        UPDATE "Job"
        SET 
          status = 'CLAIMED',
          "workerId" = $1,
          "updatedAt" = NOW()
        FROM next_job
        WHERE "Job".id = next_job.id
        RETURNING "Job".*;
      `;
      
      const result = await prisma.$queryRawUnsafe<Job[]>(query, workerId);
      
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Error claiming job', { error });
      return null;
    }
  }
}
