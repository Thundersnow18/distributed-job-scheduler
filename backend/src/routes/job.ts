import { Router } from 'express';
import { JobController } from '../controllers/job';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', JobController.createJob);
router.get('/', JobController.listJobs);

export default router;
