import { App } from 'aws-cdk-lib';
import { Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { Capture, Match, Template } from 'aws-cdk-lib/assertions';

import { LambdaStack, MonitorStack } from '../../lib/infra/stacks';

describe('Test MonitorStack', () => {
    let app: App;
    let lambdaStack: LambdaStack;
    let monitorStack: MonitorStack;

    beforeEach(() => {
        app = new App({
            outdir: 'cdk.out',
        });
        lambdaStack = new LambdaStack(app, 'MonitorLambdaStack', {
            entryPoint: 'services/lambdas/monitor/handler.ts',
            lambdaName: 'monitor',
            policiyResources: undefined,
            policyActions: undefined,
        });

        monitorStack = new MonitorStack(app, 'MonitorStack', {
            lambdaFunction: lambdaStack.lambda,
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
    });

    test('Lambda propertiees', () => {
        const lambdaStackTemplate = Template.fromStack(lambdaStack);
        lambdaStackTemplate.hasResourceProperties('AWS::Lambda::Function', {
            Handler: 'index.handler',
            Runtime: 'nodejs20.x',
            Timeout: 30,
        });
    });

    test('SNS properties', () => {
        const monitorStackTemplate = Template.fromStack(monitorStack);
        monitorStackTemplate.hasResourceProperties('AWS::SNS::Topic', {
            DisplayName: 'monitor-slack-topic',
            TopicName: 'monitor-slack-topic',
        });
    });

    test('SNS subscription properties - with almost exact values', () => {
        const monitorStackTemplate = Template.fromStack(monitorStack);

        // const snsTopic = monitorStackTemplate.findResources('AWS::SNS::Topic');
        // const snsTopicName = Object.keys(snsTopic)[0];
        // console.log(snsTopic);

        const lambdaStackTemplate = Template.fromStack(lambdaStack);
        lambdaStackTemplate.hasResourceProperties('AWS::SNS::Subscription', {
            Protocol: 'lambda',
            TopicArn: Match.objectLike({
                'Fn::ImportValue': Match.stringLikeRegexp('MonitorStack'),
            }),
            Endpoint: Match.objectLike({
                'Fn::GetAtt': [
                    Match.stringLikeRegexp('monitor'), // matches the logical ID prefix
                    'Arn',
                ],
            }),
        });
    });

    test('Alarm actions - using Capture', () => {
        const monitorStackTemplate = Template.fromStack(monitorStack);
        const alarmActionsCapture = new Capture();
        monitorStackTemplate.hasResourceProperties('AWS::CloudWatch::Alarm', {
            AlarmActions: alarmActionsCapture,
        });

        expect(alarmActionsCapture.asArray()).toEqual([
            {
                Ref: expect.stringMatching(/^monitorslacktopic/),
            },
        ]);
    });

    test('Monitor stack snapshot', () => {
        const monitorStackTemplate = Template.fromStack(monitorStack);
        expect(monitorStackTemplate.toJSON()).toMatchSnapshot();
    });

    test('Lambda stack snapshot', () => {
        const lambdaStackTemplate = Template.fromStack(lambdaStack);
        expect(lambdaStackTemplate.toJSON()).toMatchSnapshot();
    });
});
