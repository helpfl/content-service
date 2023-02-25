import { BlogContentRepository } from "./blog-content-repository";
import { ContentCreator } from "./content-creator";
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';
import {v4} from 'uuid';

export class ContentCreatorHandler {

    constructor(
        private readonly blogContentRepository: BlogContentRepository,
        private readonly contentCreator: ContentCreator
    ) {}

    invoke: () => Promise<void> = async () => {
        const content = await this.contentCreator.create();
        await this.blogContentRepository.post(content);
    }
}

const dynamoDb = new DynamoDB({});
const blogContentRepository = new BlogContentRepository(dynamoDb, v4);
const secretsManager = new SecretsManager({});
const secretName = 'OpenAIApiKey';
const contentCreator = new ContentCreator(secretsManager, secretName);
export const handler = new ContentCreatorHandler(blogContentRepository, contentCreator).invoke;