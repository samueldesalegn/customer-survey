import AWS from 'aws-sdk';

AWS.config.update({ region: 'us-east-1' });

const dynamoDb = new AWS.DynamoDB();
const documentClient = new AWS.DynamoDB.DocumentClient();
const tableName = 'event_feedback';

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

		if (!feedback[key] && expectedType !== 'string') {
			throw new Error(`Missing or invalid field: ${key}`);
		}

		if (actualType !== expectedType) {
			throw new Error(`Invalid type for ${key}. Expected ${expectedType}, got ${actualType}`);
		}
	}
};

const FeedbackModel = {
	createTableIfNotExists: async () => {
		try {
			await dynamoDb.describeTable({ TableName: tableName }).promise();
			console.log(`Table "${tableName}" already exists.`);
		} catch (error) {
			if (error.code === 'ResourceNotFoundException') {
				const params = {
					TableName: tableName,
					KeySchema: [
						{ AttributeName: 'event_id', KeyType: 'HASH' },  // Partition key
					],
					AttributeDefinitions: [
						{ AttributeName: 'event_id', AttributeType: 'S' },
					],
					ProvisionedThroughput: {
						ReadCapacityUnits: 5,
						WriteCapacityUnits: 5,
					},
				};
				await dynamoDb.createTable(params).promise();
				await dynamoDb.waitFor('tableExists', { TableName: tableName }).promise();
				console.log(`Table "${tableName}" is now active.`);
			} else {
				throw error;
			}
		}
	},

	saveFeedback: async (feedback) => {
		// Validate feedback schema before saving
		try {
			validateFeedback(feedback);
		} catch (error) {
			throw new Error(`Invalid feedback data: ${error.message}`);
		}

		const params = {
			TableName: tableName,
			Item: feedback,
		};

		await documentClient.put(params).promise();
		console.log('Feedback saved successfully.');
	},

	getAllFeedback: async () => {
		const params = { TableName: tableName };
		const result = await documentClient.scan(params).promise();
		return result.Items;
	},
};

export default FeedbackModel;
