import { Router } from 'express';
import { obterDashboard } from '../services/dashboard.service.js';

const router = Router();

// GET /api/dashboard
router.get('/', (_req, res) => {
  res.json(obterDashboard());
});

export default router;
