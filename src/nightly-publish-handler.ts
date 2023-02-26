import { ContentRepository } from './content-repository';
import { ContentGenerator } from './content-generator';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import {nanoid} from 'nanoid';

export class NightlyPublishHandler {

    constructor(
        private readonly blogContentRepository: ContentRepository,
        private readonly contentCreator: ContentGenerator
    ) {}

    invoke: () => Promise<void> = async () => {
        const content = await this.contentCreator.create();
        await this.blogContentRepository.post(content);
    }
}

const dynamoDb = new DynamoDB({});
const blogContentRepository = new ContentRepository(dynamoDb, nanoid);
const secretsManager = new SecretsManager({});
const secretName = 'OpenAIApiKey';
const contentCreator = new ContentGenerator(secretsManager, secretName);
export const handler = new NightlyPublishHandler(blogContentRepository, contentCreator).invoke;