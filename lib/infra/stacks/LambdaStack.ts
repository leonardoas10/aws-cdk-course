import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { join } from 'path';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface LambdaStackProps extends StackProps {
    readonly lambdaName: string;
    readonly entryPoint: string;
    readonly policyActions?: Array<string> | undefined;
    readonly policiyResources?: Array<string> | undefined;
    readonly environment?: { [key: string]: string };
    readonly runtime?: Runtime;
    readonly timeout?: number;
}

/**
 * The `LambdaStack` class is a custom AWS CDK stack that sets up a Node.js Lambda
 * function with an API Gateway integration and an IAM policy.
 *
 * This stack creates a Lambda function from a Node.js entry point, configures its
 * runtime, environment variables, and execution timeout. It also attaches an IAM policy
 * to the Lambda execution role, allowing the Lambda function to perform specified actions
 * on specified resources. Additionally, it sets up an API Gateway Lambda integration.
 *
 * @param scope The scope in which this stack is defined.
 * @param id The identifier for this stack.
 * @param props The properties for configuring the Lambda stack, including:
 *  - `lambdaName`: The name of the Lambda function.
 *  - `entryPoint`: The path to the entry point file for the Lambda function handler.
 *  - `policyActions`: An optional list of actions to be allowed by the Lambda function's IAM policy.
 *  - `policiyResources`: An optional list of resources for which the actions are allowed by the IAM policy.
 *  - `environment`: Optional environment variables to set for the Lambda function.
 *  - `runtime`: Optional runtime environment for the Lambda function. Defaults to `Runtime.NODEJS_20_X`.
 *  - `timeout`: Optional timeout for the Lambda function execution in seconds. Defaults to 30 seconds.
 */
export class LambdaStack extends Stack {
    public readonly lambdaIntegration: LambdaIntegration;
    public readonly lambda: NodejsFunction;

    constructor(
        scope: Construct,
        id: string,
        {
            lambdaName,
            entryPoint = '/',
            environment = {},
            runtime = Runtime.NODEJS_20_X,
            policyActions = ['*'],
            policiyResources = ['*'],
            timeout = 30,
            ...props
        }: LambdaStackProps
    ) {
        super(scope, id, props);

        const lambda = new NodejsFunction(this, lambdaName, {
            runtime: runtime,
            entry: join(__dirname, `../../${entryPoint}`),
            handler: 'handler',
            environment,
            timeout: Duration.seconds(timeout),
        });

        lambda.addToRolePolicy(
            new PolicyStatement({
                effect: Effect.ALLOW,
                actions: policyActions,
                resources: policiyResources,
            })
        );

        this.lambdaIntegration = new LambdaIntegration(lambda);
        this.lambda = lambda;
    }
}
