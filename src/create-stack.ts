#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BlogContentStack } from './blog-content-stack';
import { ContentCreatorStack } from './content-creator-stack';

const app = new cdk.App();
const configuration = {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
};

const blogContentStack = new BlogContentStack(app, 'BlogStack', configuration)
new ContentCreatorStack(app, 'ContentCreatorStack', {...configuration, blogContentTable: blogContentStack.table});