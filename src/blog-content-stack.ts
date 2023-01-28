import { Stack, StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { DynamoDB } from 'aws-sdk';
import { Construct } from 'constructs';
import { v4 } from 'uuid';
import { BlogContentHandler } from './blog-content-handler';
import { BlogContentRepository } from './blog-content-repository';

export class BlogContentStack extends Stack {

    constructor(
        scope: Construct,
        id: string,
        props?: StackProps
    ) {
        super(scope, id, props);
    
        const getBlogContentFn = new NodejsFunction(this, 'BlogContentFn', {
            entry: blogContentHandlerPath,
            handler: blogContentHandlerName,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });

        const blogContentIntegration = new LambdaIntegration(getBlogContentFn);

        const blogApi = new RestApi(this, 'BlogApi');
        blogApi.root.addMethod('GET', blogContentIntegration);

        const blogContentTable = new Table(this, 'BlogContentTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            sortKey: {
                name: 'date',
                type: AttributeType.NUMBER
            },
            tableName: 'BlogContent',
        });

        blogContentTable.addGlobalSecondaryIndex({
            indexName: 'dateIndex',
            partitionKey: {
                name: 'date',
                type: AttributeType.NUMBER
            }
        });

        blogContentTable.grantReadData(getBlogContentFn);

        new Secret(this, 'ApiKeySecret', {});
    }

}

const dynamoDb = new DynamoDB();
const blogContentRepository = new BlogContentRepository(dynamoDb, v4);
const blogContentHandlerPath = __filename;
const blogContentHandlerName = 'blogContentHandler';
export const blogContentHandler = new BlogContentHandler(blogContentRepository).invoke;