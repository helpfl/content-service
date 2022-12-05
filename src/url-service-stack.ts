import {Stack, StackProps} from 'aws-cdk-lib';
import { Integration, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
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
        this.createTable();
        this.createApi();
    }

    private createTable() {
        new Table(this, 'UrlTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: 'UrlTable',
        });    
    }

    private createApi() {
        const api = new RestApi(this, 'UrlApi');
        const createUrlFunction = new NodejsFunction(this, 'CreateUrlFunction', {
            entry: urlPostPath,
            handler: urlPostHandlerName,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
              },
        });
        const integration = new LambdaIntegration(createUrlFunction);
        api.root.addMethod('POST', integration);
    }

}
