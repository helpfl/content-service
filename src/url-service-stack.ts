import {Stack, StackProps} from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, RequestValidator, Model, JsonSchemaType } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import {Construct} from 'constructs';
import { blogContentHandlerName, blogContentHandlerPath, urlGetHandlerName, urlGetHandlerPath, urlPostHandlerName, urlPostPath, urlResolverHandlerName, urlResolverHandlerPath } from './container';

export class UrlServiceStack extends Stack {

    constructor(
        scope: Construct,
        id: string,
        props?: StackProps
    ) {
        super(scope, id, props);
    
        const createUrlFunction = new NodejsFunction(this, 'CreateUrlFunction', {
            entry: urlPostPath,
            handler: urlPostHandlerName,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });
        const createRecrodIntegration = new LambdaIntegration(createUrlFunction);
        const getRecordFunction = new NodejsFunction(this, 'GetRecordFunction', {
             entry: urlGetHandlerPath,
            handler: urlGetHandlerName,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });
        const getRecordIntegration = new LambdaIntegration(getRecordFunction);
        const urlApi = new RestApi(this, 'UrlApi', {});
        urlApi.root.addMethod('POST', createRecrodIntegration, {
            requestValidator: new RequestValidator(
                this,
                'post-body-validator',
                {
                  restApi: urlApi,
                  requestValidatorName: 'body-validator',
                  validateRequestBody: true,
                }
              ),
              requestModels: {
                'application/json': new Model(this, 'UrlRecordPayload', { // TODO: Make this align with the real type
                    restApi: urlApi,
                    contentType: 'application/json',
                    description: 'To validate the request body',
                    modelName: 'UrlRecordPayload',
                    schema: {
                        type: JsonSchemaType.OBJECT,
                        required: ['redirectUrl'],
                        properties: {
                            redirectUrl: {
                                type: JsonSchemaType.STRING,
                                format: 'uri',
                            },
                        },
                    }
                }),
            }
        });

        urlApi.root.addResource('{id}').addMethod('GET', getRecordIntegration);

        const urlResolverFunction = new NodejsFunction(this, 'UrlResolverFunction', {
            entry: urlResolverHandlerPath,
            handler: urlResolverHandlerName,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });
        const urlResolverIntegration = new LambdaIntegration(urlResolverFunction);
        const linkApi = new RestApi(this, 'LinkApi');
        linkApi.root.addResource('{id}').addMethod('GET', urlResolverIntegration);

        const urlTable = new Table(this, 'UrlTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },

            tableName: 'UrlTable',
        });

        urlTable.grantWriteData(createUrlFunction);
        urlTable.grantReadData(getRecordFunction);
        urlTable.grantReadData(urlResolverFunction);

        urlTable.addGlobalSecondaryIndex({
            indexName: 'urlIndex',
            partitionKey: {
                name: 'url',
                type: AttributeType.STRING
            }
        });


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
