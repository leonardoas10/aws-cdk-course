import {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Context,
} from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

import { validateAsSpaceEntry } from '../../shared/Validator';
import { createRandomId, parseJSON } from '../../shared/Utils';

export async function postSpaces(
    event: APIGatewayProxyEvent,
    ddbClient: DynamoDBClient,
    context: Context
): Promise<APIGatewayProxyResult> {
    const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
    const randomId = createRandomId();
    const item = parseJSON(event.body!);
    item.id = randomId;
    validateAsSpaceEntry(item);

    const result = await ddbDocClient.send(
        new PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(item),
            // Item: marshall(item),
            // Item: {
            //     id: {
            //         S: randomId,
            //     },
            //     location: {
            //         S: item.location,
            //     },
            // },
        })
    );
    return {
        statusCode: 201,
        body: JSON.stringify(result),
    };
}
