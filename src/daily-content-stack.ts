import { Stack, StackProps } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import * as eventTargets from 'aws-cdk-lib/aws-events-targets';
import {Code, Function, Runtime} from 'aws-cdk-lib/aws-lambda';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';

export type DailyContentStackProps = StackProps & {
  stage: string
};

export class DailyContentStack extends Stack {

  constructor(
    scope: Construct,
    props: DailyContentStackProps
  ) {
    super(scope, `DailyContent-${props.stage}`, props);

    const dailyContentFunction = new Function(this, 'DailyContentFunction', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'daily-content-handler.handler',
      code: Code.fromAsset(path.join(__dirname, '..', 'build', 'daily-content')),
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
    cronRule.addTarget(new eventTargets.LambdaFunction(dailyContentFunction));
    // props.contentTable.grantWriteData(dailyContentFunction);
    const secret = new Secret(this, 'OpenAIApiKeySecret', {secretName: 'OpenAIApiKey'});
    secret.grantRead(dailyContentFunction);
  }

}
