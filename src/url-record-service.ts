import { UrlRecord, UrlRecordPayload } from './url-record';
import {DateTime} from 'luxon';
import {DynamoDB} from 'aws-sdk';

export type UrlRecordServiceInterface = {
    create(payload: UrlRecordPayload): Promise<UrlRecord>;
    getById(id: string): Promise<UrlRecord>;
    getByUrl(url: string): Promise<UrlRecord>;
}

export class UrlRecordService implements UrlRecordServiceInterface {

    constructor(
        private readonly dynamo: DynamoDB,
        private readonly uuid: () => string) {
    }

    async create(payload: UrlRecordPayload): Promise<UrlRecord> {
        const record: UrlRecord = {
            ...payload,
            createdAt: DateTime.utc().toISO(),
            id: this.uuid(),
            url: `https://link.helpfl.click/${(this.randomUrlPath())}`
        };
        await this.persist(record);
        return record;
    }

    async getById(id: string): Promise<UrlRecord> {
        const result = await this.dynamo.getItem({
            TableName: 'UrlTable',
            Key: DynamoDB.Converter.marshall({id})
        }).promise();
        if (!result.Item) {
            throw new NotFoundError(`Item was not found: ${id}`);
        }
        return DynamoDB.Converter.unmarshall(result.Item) as UrlRecord;
    }

    async getByUrl(url: string): Promise<UrlRecord> {
        const result = await this.dynamo.query({
            TableName: 'UrlTable',
            IndexName: 'urlIndex',
            KeyConditionExpression: '#url = :url',
            ExpressionAttributeNames: {
                '#url': 'url'
            },
            ExpressionAttributeValues: DynamoDB.Converter.marshall({':url': url})
        }).promise();
        if (!result.Items) {
            throw new NotFoundError(`Item was not found: ${url}`);
        }
        if (result.Items.length > 1) {
            throw new InternalServerError(`Multiple items found: ${url}`);
        }
        const [urlRecord] = result.Items;
        return DynamoDB.Converter.unmarshall(urlRecord) as UrlRecord;
        
    } 

    private randomUrlPath(): string {
        return Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
    }

    private async persist(record: UrlRecord): Promise<void> {
        const serializedRecord = DynamoDB.Converter.marshall(record);
        await this.dynamo.putItem({
            TableName: 'UrlTable',
            Item: serializedRecord
        }).promise();
    }
        
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class InternalServerError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InternalServerError';
    }
}