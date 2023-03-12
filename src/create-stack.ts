#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import {ContentServiceStack} from './content-service-stack';

const app = new App();
const stage = process.env.STAGE || 'dev';
export const stack = new ContentServiceStack(app, `ContentService-${stage}`, {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
    stage
});
