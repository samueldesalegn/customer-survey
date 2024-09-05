import awsServerlessExpress from 'aws-serverless-express';
import app from './app.js';

const server = awsServerlessExpress.createServer(app);

export const lambdaHandler = (event, context) => {
	return awsServerlessExpress.proxy(server, event, context);
};
