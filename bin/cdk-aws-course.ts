import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';

import {
    LambdaStack,
    ApiRestStack,
    S3BucketStack,
    DataStack,
} from '../lib/infra/stacks';

const app = new cdk.App();
const spaceFinderDataStack = new DataStack(app, 'SpaceFinderDataStack', {});
const spaceFinderLambdaStack = new LambdaStack(app, 'SpaceFinderLambdaStack', {
    entryPoint: 'services/lambdas/space-finder/handler.ts',
    lambdaName: 'space-finder',
    environment: {
        TABLE_NAME: spaceFinderDataStack.table.tableName,
    },
    policiyResources: [spaceFinderDataStack.table.tableArn],
    policyActions: [
        'dynamodb:PutItem',
        'dynamodb:Scan',
        'dynamodb:DeleteItem',
        'dynamodb:GetItem',
        'dynamodb:UpdateItem',
    ],
});

new ApiRestStack(app, 'SpaceFinderApiRestStack', {
    apiGatewayName: 'SpaceFinderApi',
    resourceConfigs: [
        {
            path: 'spaces',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            lambdaIntegration: spaceFinderLambdaStack.lambdaIntegration,
        },
    ],
});
