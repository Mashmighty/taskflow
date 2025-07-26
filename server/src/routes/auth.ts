import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile
} from '../controllers/authcontroller';
import {
  validateUserRegistration,
  validateUserLogin
} from '../middleware/validation';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', validateUserRegistration, register);
router.post('/login', validateUserLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

export default router;