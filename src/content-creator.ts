import { SecretsManager } from "aws-sdk";
import * as fetch from "node-fetch";

export class ContentCreator {
    constructor(
        private readonly secretsManager: SecretsManager,
        private readonly secretName: string,
        private readonly nodeFetch: typeof fetch,
    ) {}

    public async create(): Promise<string> {
        const apiKey = await this.getApiKey();
        console.log('api Key: ', apiKey);
        return `Hello world! ${Date.now()}`;
    }

    private async getApiKey(): Promise<string> {
        const {SecretString: apiKey} = await this.secretsManager.getSecretValue({SecretId: this.secretName}).promise();
        if (apiKey === undefined) {
            throw new Error('No API key found');
        }
        return apiKey ;
    } 
}