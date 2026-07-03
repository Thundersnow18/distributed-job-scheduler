import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth';
import queueRoutes from './routes/queue';
import jobRoutes from './routes/job';

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/jobs', jobRoutes);

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Server is running' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: [err.message]
  });
});

export default app;
