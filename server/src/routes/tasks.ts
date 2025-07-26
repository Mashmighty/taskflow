import express from 'express';
import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskPosition,
  getTasksByStatus
} from '../controllers/taskController';
import { validateTask } from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// PUT SPECIFIC ROUTES FIRST - before general parameter routes
router.get('/project/:projectId/status', getTasksByStatus);
router.put('/:id/position', updateTaskPosition);

// GENERAL ROUTES COME AFTER SPECIFIC ONES
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', validateTask, createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;