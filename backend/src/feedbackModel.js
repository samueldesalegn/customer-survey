import AWS from 'aws-sdk';

// Set AWS region
AWS.config.update({ region: 'us-east-1' });

const dynamoDb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'event_feedback'; // DynamoDB table name

// Feedback schema validation function
const validateFeedback = (feedback) => {
	const schema = {
		event_id: 'string',
		event_date: 'string',
		event_name: 'string',
		event_rate: 'number',
		why_this_rate: 'string',
		presentation_content: 'number',
		session_duration: 'number',
	};

	for (const key in schema) {
		const expectedType = schema[key];
		const actualType = typeof feedback[key];

		// Handle missing required fields
		if (feedback[key] === undefined || feedback[key] === null) {
			throw new Error(`Missing required field: ${key}`);
		}

		// Validate the type of each field
		if (actualType !== expectedType) {
			throw new Error(`Invalid type for ${key}. Expected ${expectedType}, got ${actualType}`);
		}
	}
};

// Model object for feedback operations
const FeedbackModel = {
	// Method to create the DynamoDB table if it doesn't exist
	createTableIfNotExists: async () => {
		try {
			// Check if the table exists
			await dynamoDb.describeTable({ TableName: tableName }).promise();
			console.log(`Table "${tableName}" already exists.`);
		} catch (error) {
			if (error.code === 'ResourceNotFoundException') {
				console.log(`Table "${tableName}" does not exist. Creating now...`);
				const params = {
					TableName: tableName,
					KeySchema: [
						{ AttributeName: 'event_id', KeyType: 'HASH' }, // Partition key
					],
					AttributeDefinitions: [
						{ AttributeName: 'event_id', AttributeType: 'S' }, // String type
					],
					ProvisionedThroughput: {
						ReadCapacityUnits: 5,
						WriteCapacityUnits: 5,
					},
				};
				// Create the table
				await dynamoDb.createTable(params).promise();
				console.log(`Table "${tableName}" created successfully.`);
				// Wait until the table becomes active
				await dynamoDb.waitFor('tableExists', { TableName: tableName }).promise();
				console.log(`Table "${tableName}" is now active.`);
			} else {
				// Throw error if there's a different issue
				console.error('Error creating table:', error);
				throw error;
			}
		}
	},

	// Method to save feedback to the DynamoDB table
	saveFeedback: async (feedback) => {
		// Validate feedback schema before saving
		try {
			console.log('Validating feedback:', feedback);  // Log feedback data before validation
			validateFeedback(feedback);
		} catch (error) {
			console.error('Validation failed:', error.message);
			throw new Error(`Invalid feedback data: ${error.message}`);
		}

		// Define the parameters for saving feedback
		const params = {
			TableName: tableName,
			Item: feedback,
		};

		try {
			console.log('Saving feedback to DynamoDB with params:', params);  // Log DynamoDB params
			// Save feedback to DynamoDB
			await documentClient.put(params).promise();
			console.log('Feedback saved successfully.');
		} catch (error) {
			console.error('Error saving feedback to DynamoDB:', error);  // Log error
			throw new Error('Error saving feedback to DynamoDB');
		}
	},

	// Method to retrieve all feedback entries from the DynamoDB table
	getAllFeedback: async () => {
		const params = {
			TableName: tableName,
		};

		try {
			// Scan the table to get all feedback items
			const result = await documentClient.scan(params).promise();
			return result.Items;
		} catch (error) {
			console.error('Error retrieving feedback from DynamoDB:', error);
			throw new Error('Error retrieving feedback');
		}
	},
};

export default FeedbackModel;
