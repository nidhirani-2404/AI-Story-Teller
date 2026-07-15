import express from 'express';
import { 
  createStory, 
  getStories, 
  deleteStory, 
  continueStory, 
  streamStory,
  downloadStoryAudio,
  downloadStoryPDF
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Collection Routes (Protected: Requires login token)
router.route('/')
  .post(protect, createStory)
  .get(protect, getStories);

// 2. Custom Streaming Route (Protected: Requires login token)
router.route('/stream')
  .post(protect, streamStory);

// 3. Dynamic Routes (Protected: Requires login token verification)
router.route('/:id')
  .delete(protect, deleteStory);

router.route('/:id/continue')
  .post(protect, continueStory);

// 4. Download Routes (Public: Enabled for simple anchor href file stream downloads)
router.route('/:id/audio')
  .get(downloadStoryAudio);

router.route('/:id/pdf')
  .get(downloadStoryPDF);

export default router;
