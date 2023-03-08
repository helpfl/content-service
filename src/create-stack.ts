#!/usr/bin/env node
import {App} from 'aws-cdk-lib';
import {ContentServiceStack} from './content-service-stack';
import {DailyContentStack} from './daily-content-stack';

const app = new App();

const config = {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION
    },
    stage: process.env.STAGE || 'dev'
};

new ContentServiceStack(app, config);
new DailyContentStack(app, config);
