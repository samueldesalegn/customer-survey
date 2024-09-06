import express from 'express';
import cors from 'cors';
import feedbackRoutes from './feedbackRoutes.js'; // Correct import of the routes file

const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// Use the feedback routes under the "/api" path
app.use('/api', feedbackRoutes);

export default app;
