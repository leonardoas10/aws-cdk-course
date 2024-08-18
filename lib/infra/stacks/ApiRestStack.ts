import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

type THttpMethod =
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE'
    | 'PATCH'
    | 'OPTIONS'
    | 'HEAD';

interface IResourceMethodConfig {
    path: string;
    methods: THttpMethod[];
    lambdaIntegration: LambdaIntegration;
}

interface IApiRestStackProps extends StackProps {
    readonly apiGatewayName: string;
    readonly resourceConfigs: IResourceMethodConfig[];
    readonly apiGatewayDescription?: string;
}

/**
 * The `ApiRestStack` class is a custom AWS CDK stack that sets up an API Gateway with
 * specified resource paths and methods, each integrated with a Lambda function.
 *
 * This stack creates a REST API using AWS API Gateway and configures it with resources and methods
 * based on the provided `resourceConfigs`. Each resource path can be associated with one or more
 * HTTP methods (e.g., GET, POST) and integrated with a Lambda function to handle requests.
 *
 * @param scope The scope in which this stack is defined.
 * @param id The identifier for this stack.
 * @param props The properties for configuring the API Gateway stack, including:
 *  - `apiGatewayName`: The name of the API Gateway.
 *  - `resourceConfigs`: An array of resource configurations, where each configuration includes:
 *    - `path`: The path of the resource in the API Gateway.
 *    - `methods`: An array of HTTP methods supported by this resource.
 *    - `lambdaIntegration`: The Lambda integration to handle requests for this resource.
 *  - `apiGatewayDescription`: An optional description for the API Gateway. Defaults to '<insert a properly description>'.
 */
export class ApiRestStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        {
            apiGatewayName,
            apiGatewayDescription = '<insert a properly description>',
            resourceConfigs,
            ...props
        }: IApiRestStackProps
    ) {
        super(scope, id, props);

        const api = new RestApi(this, apiGatewayName, {
            restApiName: apiGatewayName,
            description: apiGatewayDescription,
        });

        resourceConfigs.forEach((config) => {
            const resource = api.root.addResource(config.path);
            config.methods.forEach((method) => {
                resource.addMethod(method, config.lambdaIntegration);
            });
        });
    }
}
