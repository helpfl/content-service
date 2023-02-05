import { Stack, StackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { DynamoDB, SecretsManager } from 'aws-sdk';
import { Construct } from 'constructs';
import { v4 } from 'uuid';
import { BlogContentRepository } from './blog-content-repository';
import { ContentCreatorHandler } from './content-creator-handler';
import * as fetch from 'node-fetch';
import { ContentCreator } from './content-creator';

export type ContentCreatorStackProps = StackProps & {blogContentTable: Table};

export class ContentCreatorStack extends Stack {

    constructor(
        scope: Construct,
        id: string,
        props: ContentCreatorStackProps
    ) {
        super(scope, id, props);
    
        const createContentFn = new NodejsFunction(this, 'ContentCreateFn', {
            entry: contentCreatorHandlerPath,
            handler: contentCreatorHandlerName,
            runtime: Runtime.NODEJS_16_X,
            environment: {
                NODE_OPTIONS: '--enable-source-maps',
            }
        });
        const everydayAtMidnight = {
            minute: '0',
            hour: '0',
            day: '*',
            month: '*',
            year: '*'
        };
        const cronRule = new Rule(this, 'CronRule', {
            schedule: Schedule.cron(everydayAtMidnight)
        });
        cronRule.addTarget(new eventTargets.LambdaFunction(createContentFn));
        props.blogContentTable.grantWriteData(createContentFn);
        const secret = new Secret(this, 'OpenAIApiKeySecret', {secretName});
        secret.grantRead(createContentFn);
    }

}

const dynamoDb = new DynamoDB();
const blogContentRepository = new BlogContentRepository(dynamoDb, v4);
const contentCreatorHandlerPath = __filename;
const contentCreatorHandlerName = 'contentCreatorHandler';
const secretsManager = new SecretsManager();
const secretName = 'OpenAIApiKey';
const contentCreator = new ContentCreator(secretsManager, secretName, fetch);
export const contentCreatorHandler = new ContentCreatorHandler(blogContentRepository, contentCreator).invoke;