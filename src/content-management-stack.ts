import { Stack, StackProps } from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';

export class ContentManagementStack extends Stack {

    table: Table;

    constructor(
        scope: Construct,
        id: string,
        props?: StackProps
    ) {
        super(scope, id, props);

        const apiFunction = new NodejsFunction(this, 'ApiFunction', {
            entry: path.join(__dirname, '..', 'build', 'content-management-handler.js'),
            handler: 'handler',
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });

        const lambdaIntegration = new LambdaIntegration(apiFunction);

        const api = new RestApi(this, 'API', {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS
            }
        });
        api.root.addMethod('GET', lambdaIntegration);

        this.table = new Table(this, 'ContentTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: 'Content',
        });
        this.table.addGlobalSecondaryIndex({
            indexName: 'nameIndex',
            partitionKey: {
                name: 'name',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'date',
                type: AttributeType.NUMBER
            }
        });

        this.table.grantReadData(apiFunction);
    }

}