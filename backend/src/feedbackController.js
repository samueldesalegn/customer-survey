import FeedbackModel from './feedbackModel.js';

// Handle submission of feedback
export const submitFeedback = async (req, res) => {
	const feedback = req.body;

	// Check if the feedback data is present
	if (!feedback || Object.keys(feedback).length === 0) {
		return res.status(400).json({ error: 'Feedback data is required' });
	}

	try {
		// Save the feedback using the Model
		await FeedbackModel.saveFeedback(feedback);
		res.status(200).json({ message: 'Feedback submitted successfully' });
	} catch (error) {
		console.error('Error saving feedback:', error.message);
		// Return 500 status code for internal server errors
		res.status(500).json({ error: `Failed to submit feedback: ${error.message}` });
	}
};

// Handle retrieving all feedbacks
export const getAllFeedback = async (req, res) => {
	try {
		// Retrieve all feedback entries from DynamoDB
		const feedbackList = await FeedbackModel.getAllFeedback();
		res.status(200).json(feedbackList);
	} catch (error) {
		console.error('Error retrieving feedback:', error.message);
		// Return 500 status code for internal server errors
		res.status(500).json({ error: 'Could not retrieve feedback' });
	}
};
