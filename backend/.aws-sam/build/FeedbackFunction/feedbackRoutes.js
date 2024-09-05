import express from 'express';
import { submitFeedback, getAllFeedback } from './feedbackController.js';

const router = express.Router();

// Route to handle feedback submission
router.post('/submit-feedback', submitFeedback);

// Route to get all feedback
router.get('/feedbacks', getAllFeedback);

export default router;
