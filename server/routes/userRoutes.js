import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

// Route: /api/user/signup
router.post('/signup', registerUser);

// Route: /api/user/login
router.post('/login', loginUser);

export default router;
