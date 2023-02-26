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

        const getBlogContentFn = new NodejsFunction(this, 'BlogContentFn', {
            entry: path.join(__dirname, '..', 'build', 'blog-content-handler.js'),
            handler: 'handler',
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });

        const blogContentIntegration = new LambdaIntegration(getBlogContentFn);

        const blogApi = new RestApi(this, 'BlogApi', {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS
            }
        });
        blogApi.root.addMethod('GET', blogContentIntegration);

        this.table = new Table(this, 'BlogContentTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: 'BlogContent',
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

        this.table.grantReadData(getBlogContentFn);
    }

}