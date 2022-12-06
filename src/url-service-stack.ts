import {Stack, StackProps} from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, RequestValidator, Model, JsonSchemaType } from 'aws-cdk-lib/aws-apigateway';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {Construct} from 'constructs';
import { urlPostHandlerName, urlPostPath } from './container';

export class UrlServiceStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        props?: StackProps
    ) {
        super(scope, id, props);
        const urlTable = new Table(this, 'UrlTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },

            tableName: 'UrlTable',
        });

        urlTable.addGlobalSecondaryIndex({
            indexName: 'urlIndex',
            partitionKey: {
                name: 'url',
                type: AttributeType.STRING
            }
        });
    
        const createUrlFunction = new NodejsFunction(this, 'CreateUrlFunction', {
            entry: urlPostPath,
            handler: urlPostHandlerName,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });

        const integration = new LambdaIntegration(createUrlFunction);

        const urlApi = new RestApi(this, 'UrlApi', {});

        urlApi.root.addMethod('POST', integration, {
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
                'application/json': new Model(this, 'model-validator', {
                    restApi: urlApi,
                    contentType: 'application/json',
                    description: 'To validate the request body',
                    modelName: 'Url Record',
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
              },
        });

        urlTable.grantWriteData(createUrlFunction);
    }

}
