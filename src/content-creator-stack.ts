import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';

export type ContentCreatorStackProps = StackProps & {blogContentTable: Table};

export class ContentCreatorStack extends Stack {

    constructor(
        scope: Construct,
        id: string,
        props: ContentCreatorStackProps
    ) {
        super(scope, id, props);
    
        const createContentFn = new NodejsFunction(this, 'ContentCreateFn', {
            entry: path.join(__dirname, '..', 'build', 'content-creator-handler.js'),
            handler: 'handler',
            runtime: Runtime.NODEJS_16_X,
            timeout: Duration.minutes(3),
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
        const secret = new Secret(this, 'OpenAIApiKeySecret', {secretName: 'OpenAIApiKey'});
        secret.grantRead(createContentFn);
    }

}
