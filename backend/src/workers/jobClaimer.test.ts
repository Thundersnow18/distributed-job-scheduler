import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobClaimer } from './jobClaimer';
import prisma from '../prisma/client';

// Mock prisma
vi.mock('../prisma/client', () => ({
  default: {
    $queryRawUnsafe: vi.fn(),
  },
}));

describe('JobClaimer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should atomically claim a job using SKIP LOCKED', async () => {
    const mockJob = { id: 'job-1', status: 'CLAIMED', workerId: 'worker-1' };
    (prisma.$queryRawUnsafe as any).mockResolvedValue([mockJob]);

    const result = await JobClaimer.claimNextJob('worker-1');

    expect(prisma.$queryRawUnsafe).toHaveBeenCalledTimes(1);
    const queryArg = (prisma.$queryRawUnsafe as any).mock.calls[0][0];
    expect(queryArg).toContain('FOR UPDATE SKIP LOCKED');
    expect(result).toEqual(mockJob);
  });

  it('should return null if no jobs are available', async () => {
    (prisma.$queryRawUnsafe as any).mockResolvedValue([]);

    const result = await JobClaimer.claimNextJob('worker-1');

    expect(result).toBeNull();
  });
});
