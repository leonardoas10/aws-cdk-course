import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';

import {
    LambdaStack,
    ApiRestStack,
    S3BucketStack,
    DataStack,
    MonitorStack,
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

const monitorLambdaStack = new LambdaStack(app, 'MonitorLambdaStack', {
    entryPoint: 'services/lambdas/monitor/handler.ts',
    lambdaName: 'monitor',
    policiyResources: undefined,
    policyActions: undefined,
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

new MonitorStack(app, 'MonitorStack', {
    lambdaFunction: monitorLambdaStack.lambda,
    cloudWatchAlarmName: 'monitor-slack-cloudwatch',
    snsTopicAlarmName: 'monitor-slack-topic',
    evaluationPeriods: 1,
    metricName: 'Invocations',
    metricNamespace: 'AWS/Lambda',
    metricPeriod: 60,
    metricStatistic: 'Sum',
    metricUnit: Unit.COUNT,
    threshold: 1,
    dimesionsMapApiName: 'SpaceFinderApi',
});
