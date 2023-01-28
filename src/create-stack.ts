#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BlogContentStack } from './blog-content-stack';

const app = new cdk.App();
const configuration = {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
};

new BlogContentStack(app, 'BlogStack', configuration)