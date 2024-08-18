import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Alarm, Metric, Unit } from 'aws-cdk-lib/aws-cloudwatch';
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Topic } from 'aws-cdk-lib/aws-sns';
import { LambdaSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

interface IMonitorStackProps extends StackProps {
    readonly lambdaFunction: NodejsFunction;
    readonly snsTopicAlarmName: string;
    readonly cloudWatchAlarmName: string;
    readonly evaluationPeriods: number;
    readonly threshold: number;
    readonly metricName: string;
    readonly metricNamespace: string;
    readonly metricPeriod: number;
    readonly metricStatistic: 'Sum';
    readonly metricUnit: Unit;
}

/**
 * The `MonitorStack` class is a custom AWS CDK stack that sets up monitoring
 * and alerting for a given AWS Lambda function using CloudWatch Alarms and SNS.
 *
 * This stack creates a CloudWatch Alarm that monitors a specified metric from
 * a given AWS Lambda function. If the alarm is triggered, it sends a notification
 * through an SNS Topic, which can be handled by the same Lambda function or
 * other subscribers.
 *
 * @param scope The scope in which this stack is defined.
 * @param id The identifier for this stack.
 * @param props The properties for configuring the monitoring stack, including:
 *  - `lambdaFunction`: The Lambda function to monitor.
 *  - `snsTopicAlarmName`: The name of the SNS Topic used for notifications.
 *  - `cloudWatchAlarmName`: The name of the CloudWatch Alarm.
 *  - `evaluationPeriods`: The number of periods over which data is compared
 *    to the specified threshold.
 *  - `threshold`: The value against which the specified metric is compared.
 *  - `metricName`: The name of the CloudWatch metric to monitor.
 *  - `metricNamespace`: The namespace of the CloudWatch metric.
 *  - `metricPeriod`: The period over which the specified statistic is applied.
 *  - `metricStatistic`: The statistic to apply to the metric (e.g., `Sum`).
 *  - `metricUnit`: The unit of the metric being monitored.
 */
export class MonitorStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        {
            snsTopicAlarmName,
            cloudWatchAlarmName,
            lambdaFunction,
            evaluationPeriods,
            threshold,
            metricName,
            metricNamespace,
            metricPeriod,
            metricStatistic,
            metricUnit,
            ...props
        }: IMonitorStackProps
    ) {
        super(scope, id, props);

        const alarmTopic = new Topic(this, snsTopicAlarmName, {
            displayName: snsTopicAlarmName,
            topicName: snsTopicAlarmName,
        });
        alarmTopic.addSubscription(new LambdaSubscription(lambdaFunction));

        const alarm = new Alarm(this, cloudWatchAlarmName, {
            alarmName: cloudWatchAlarmName,
            evaluationPeriods,
            threshold,
            metric: new Metric({
                metricName,
                namespace: metricNamespace,
                period: Duration.minutes(metricPeriod),
                statistic: metricStatistic,
                unit: metricUnit,
            }),
        });

        const topicAction = new SnsAction(alarmTopic);
        alarm.addAlarmAction(topicAction);
        alarm.addOkAction(topicAction);
    }
}
