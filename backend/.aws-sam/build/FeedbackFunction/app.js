import express from 'express';
import cors from 'cors';
import feedbackRoutes from './feedbackController.js';

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Use the feedback routes
app.use('/api', feedbackRoutes);

export default app;
