import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

interface IS3BucketStackProps extends StackProps {
    readonly bucketName: string;
    readonly lambda?: NodejsFunction;
}

/**
 * The `S3BucketStack` class is a custom AWS CDK stack that provisions an S3 bucket
 * and optionally grants write access to a specified Lambda function.
 *
 * This stack creates an S3 bucket with the specified name. If a Lambda function is
 * provided, the stack will also grant this function write permissions to the bucket.
 *
 * @param scope The scope in which this stack is defined.
 * @param id The identifier for this stack.
 * @param props The properties for configuring the S3 bucket stack, including:
 *  - `bucketName`: The name of the S3 bucket to create.
 *  - `lambda`: An optional Lambda function to which write permissions to the S3 bucket
 *    will be granted.
 */
export class S3BucketStack extends Stack {
    public readonly bucketName: string;
    constructor(
        scope: Construct,
        id: string,
        { bucketName, lambda, ...props }: IS3BucketStackProps
    ) {
        super(scope, id, props);

        const bucket = new Bucket(this, bucketName, {
            bucketName,
        });

        lambda && bucket.grantWrite(lambda);

        bucketName = bucket.bucketName;
    }
}
