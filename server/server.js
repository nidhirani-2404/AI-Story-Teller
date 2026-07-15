import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import storyRoutes from './routes/storyRoutes.js';
import userRoutes from './routes/userRoutes.js';
import errorHandler from './middleware/errorHandler.js';

// Get __dirname equivalent for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables
dotenv.config();

// 2. Connect to MongoDB Atlas Cloud Cluster
connectDB();

// 3. Initialize Express server app
const app = express();

// 4. Register Built-in Middlewares
app.use(cors());
app.use(express.json());

// 5. Mount API Routes
app.use('/api/story', storyRoutes);
app.use('/api/user', userRoutes);

// 6. Production Mode Asset Serving
if (process.env.NODE_ENV === 'production') {
  // Serve built static asset files from Vite
  app.use(express.static(path.join(__dirname, '../client/dist')));

  // Direct unmatched get requests back to React client routing bundle
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
} else {
  // Development Fallback Route
  app.get('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint does not exist (Development Mode)'
    });
  });
}

// 7. Register Global Error Handler (must sit after endpoints)
app.use(errorHandler);

// 8. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});
