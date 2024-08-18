import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { captureAWSv3Client } from 'aws-xray-sdk-core';

import { postSpaces } from './PostSpaces';
import { getSpaces } from './GetSpaces';
import { updateSpace } from './UpdateSpace';
import { deleteSpace } from './DeleteSpace';
import { JsonError, MissingFieldError } from '../../shared/Validator';

const ddbClient = captureAWSv3Client(new DynamoDBClient({}));

async function handler(
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> {
    let message: string;

    try {
        switch (event.httpMethod) {
            case 'GET':
                const getResponse = await getSpaces(event, ddbClient, context);
                return getResponse;
                break;
            case 'POST':
                const postResponse = await postSpaces(
                    event,
                    ddbClient,
                    context
                );
                return postResponse;
            case 'PUT':
                const putResponse = await updateSpace(event, ddbClient);
                console.log(putResponse);
                return putResponse;
            case 'DELETE':
                const deleteResponse = await deleteSpace(event, ddbClient);
                console.log(deleteResponse);
                return deleteResponse;

            default:
                message = '';
                break;
        }
    } catch (error) {
        if (error instanceof MissingFieldError || error instanceof JsonError) {
            return {
                statusCode: 400,
                body: error.message,
            };
        }

        return {
            statusCode: 500,
            body: (error as Error).message,
        };
    }

    const response: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(message),
    };

    return response;
}

export { handler };
