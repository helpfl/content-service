import {Configuration, OpenAIApi} from 'openai';
import {SecretsManager} from '@aws-sdk/client-secrets-manager';

export class ContentCreator {
    constructor(
        private readonly secretsManager: SecretsManager,
        private readonly secretName: string,
    ) {}

    public async create(): Promise<string> {
        const apiKey = await this.getApiKey();
        const configuration = new Configuration({apiKey});
        const openai = new OpenAIApi(configuration);
        const todaysDate = new Date().toISOString().split('T')[0];
        const prompt = `In Markdown describe top 10 latest tech news of ${todaysDate} and write a paragraph about each of them with opinion.`;
        const completion = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            temperature: 1.0,
            max_tokens: 2000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        });
        console.log(JSON.stringify(completion.data));
        const firstText = completion.data.choices[0].text;
        if (firstText === undefined) {
            throw new Error('No text found');
        }
        return firstText;
    }

    private async getApiKey(): Promise<string> {
        const {SecretString: apiKey} = await this.secretsManager.getSecretValue({SecretId: this.secretName});
        if (apiKey === undefined) {
            throw new Error('No API key found');
        }
        return apiKey ;
    } 
}