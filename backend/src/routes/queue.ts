import { Router } from 'express';
import { QueueController } from '../controllers/queue';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', QueueController.createQueue);
router.get('/', QueueController.listQueues);
router.get('/:id', QueueController.getQueue);

export default router;
