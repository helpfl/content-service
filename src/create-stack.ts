#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ContentManagementStack } from './content-management-stack';
import { NightlyPublishStack } from './nightly-publish-stack';

const app = new cdk.App();
const configuration = {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    domainName: 'api.helpfl.click'
};

const contentStack = new ContentManagementStack(app, 'ContentManagementStack', configuration)
new NightlyPublishStack(app, 'NightlyPublishStack', {...configuration, contentTable: contentStack.table});