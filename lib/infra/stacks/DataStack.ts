import { Stack, StackProps } from 'aws-cdk-lib';
import {
    Table,
    TableProps,
    AttributeType,
    ITable,
} from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../shared/Utils';

export class DataStack extends Stack {
    public readonly table: ITable;

    constructor(scope: Construct, id: string, { ...props }: StackProps) {
        super(scope, id, props);

        const suffix = getSuffixFromStack(this);

        this.table = new Table(this, id, {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            tableName: `${id}-${suffix}`,
        } as TableProps);
    }
}
