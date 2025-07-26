import express from 'express';
import {
  collectEvent,
  batchCollectEvents,
  getAnalytics,
  getUserSessions,
  getPerformanceMetrics
} from '../controllers/rumController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes for RUM collection (no auth needed)
router.post('/collect', collectEvent);
router.post('/batch-collect', batchCollectEvents);

// Protected routes for analytics
router.get('/analytics', authenticateToken, getAnalytics);
router.get('/sessions', authenticateToken, getUserSessions);
router.get('/performance', authenticateToken, getPerformanceMetrics);

export default router;