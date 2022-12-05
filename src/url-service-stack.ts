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
       const serverlessRestApi = new ServerlessRestApi(this, 'UrlApi');
       serverlessRestApi.addEndpoint('CreateUrl', {
            method: 'POST',
            path: '',
            entry: urlPostPath,
            handler: urlPostHandlerName,
       });
    }

}

export type RestEndpointConfiguration = Readonly<{
    entry: string;
    handler: string;
    path: string;
    method: string;
}>;

class ServerlessRestApi {

    private readonly api = new RestApi(this.scope, this.id, {
        cloudWatchRole: true
    });

    private readonly lambdaFactory = new NodeJsLambdaFactory(this.scope);

    constructor(private readonly scope: Construct, private readonly id: string) {
    }

    addEndpoint(id: string, {entry, handler, path, method}: RestEndpointConfiguration) {
        const lambda = this.createLambda(id, entry, handler);
        const lambdaIntegration = this.createIntegration(lambda);
        this.createResource(path, method, lambdaIntegration);
    }

    private createIntegration(lambda: NodejsFunction): LambdaIntegration {
        return new LambdaIntegration(lambda);
    }

    private createLambda(id: string, entry: string, handler: string): NodejsFunction {
        return this.lambdaFactory.createLambda(id, entry, handler);
    }

    private createResource(path: string, method: string, integration: Integration): void {
        this.api.root.addResource(path).addMethod(method, integration);
    }
}


export interface LambdaProps {
    readonly entry: string, 
    readonly handler: string
}
class NodeJsLambdaFactory {

    constructor(private readonly scope: Construct) {
    }

    createLambda(id: string, entry: string, handler: string): NodejsFunction {
        return new NodejsFunction(this.scope, id, {
            entry,
            handler,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
              },
        });
    }
}