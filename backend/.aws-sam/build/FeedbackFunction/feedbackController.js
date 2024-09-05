import FeedbackModel from './feedbackModel.js';

// Handle submission of feedback
export const submitFeedback = async (req, res) => {
	await FeedbackModel.createTableIfNotExists();

	const feedback = req.body;

	try {
		// Save the validated feedback
		await FeedbackModel.saveFeedback(feedback);
		res.status(200).json({ message: 'Feedback submitted successfully' });
	} catch (error) {
		console.error('Error saving feedback:', error.message);
		res.status(400).json({ error: `Failed to submit feedback: ${error.message}` });
	}
};

// Handle retrieving all feedbacks
export const getAllFeedback = async (req, res) => {
	try {
		const feedbackList = await FeedbackModel.getAllFeedback();
		res.status(200).json(feedbackList);
	} catch (error) {
		console.error('Error getting feedback:', error.message);
		res.status(500).json({ error: 'Could not retrieve feedback' });
	}
};
