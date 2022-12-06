import {Stack, StackProps} from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, RequestValidator, Model, JsonSchemaType } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {Construct} from 'constructs';
import { urlGetHandlerName, urlGetHandlerPath, urlPostHandlerName, urlPostPath } from './container';

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

        const urlTable = new Table(this, 'UrlTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },

            tableName: 'UrlTable',
        });

        urlTable.grantWriteData(createUrlFunction);
        urlTable.grantReadData(getRecordFunction);

        urlTable.addGlobalSecondaryIndex({
            indexName: 'urlIndex',
            partitionKey: {
                name: 'url',
                type: AttributeType.STRING
            }
        });

    }

}
