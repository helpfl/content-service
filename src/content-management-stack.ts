import { Stack, StackProps } from 'aws-cdk-lib';
import {Cors, DomainName, EndpointType, LambdaIntegration, RestApi} from 'aws-cdk-lib/aws-apigateway';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import {Certificate} from 'aws-cdk-lib/aws-certificatemanager';
import {CfnApiMapping} from 'aws-cdk-lib/aws-apigatewayv2';

export type ContentManagementStackProps = StackProps & {
    domainName: string;
};

export class ContentManagementStack extends Stack {

    table: Table;

    constructor(
        scope: Construct,
        id: string,
        props: ContentManagementStackProps
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

        const cert = Certificate.fromCertificateArn(
          this,
          'cert',
          'arn:aws:acm:us-east-1:084882962555:certificate/bec1fe74-5ef5-4771-8190-6b9f6c75799a'
        );

        // TODO: this may need to be moved to a separate stack
        const domainName = new DomainName(this, 'DomainName', {
            domainName: props.domainName,
            certificate: cert,
            endpointType: EndpointType.EDGE,
        });

        new CfnApiMapping(this, 'ApiMapping', {
            apiId: api.restApiId,
            domainName: domainName.domainName,
            stage: api.deploymentStage.stageName,
            apiMappingKey: 'content'
        });

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