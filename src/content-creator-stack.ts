import { Stack, StackProps } from 'aws-cdk-lib';
import { Cors, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { DynamoDB } from 'aws-sdk';
import { Construct } from 'constructs';
import { v4 } from 'uuid';
import { BlogContentHandler } from './blog-content-handler';
import { BlogContentRepository } from './blog-content-repository';
import { ContentCreatorHandler } from './content-creator-handler';

export class ContentCreatorStack extends Stack {

    constructor(
        scope: Construct,
        id: string,
        props?: StackProps
    ) {
        super(scope, id, props);
    
        const getBlogContentFn = new NodejsFunction(this, 'BlogContentFn', {
            entry: contentCreatorHandlerPath,
            handler: contentCreatorHandlerName,
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

        const blogContentTable = new Table(this, 'BlogContentTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: 'BlogContent',
        });
        blogContentTable.addGlobalSecondaryIndex({
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

        blogContentTable.grantReadData(getBlogContentFn);

        new Secret(this, 'ApiKeySecret', {});
    }

}

const dynamoDb = new DynamoDB();
const blogContentRepository = new BlogContentRepository(dynamoDb, v4);
const contentCreatorHandlerPath = __filename;
const contentCreatorHandlerName = 'contentCreatorHandler';
export const contentCreatorHandler = new ContentCreatorHandler(blogContentRepository).invoke;