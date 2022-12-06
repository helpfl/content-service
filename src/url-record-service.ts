import { UrlRecord, UrlRecordPayload } from './url-record';
import {DateTime} from 'luxon';
import {DynamoDB} from 'aws-sdk';

export type UrlRecordServiceInterface = {
    create(payload: UrlRecordPayload): Promise<UrlRecord>;
    getById(id: string): Promise<UrlRecord>;
}

export class UrlRecordService implements UrlRecordServiceInterface {

    constructor(
        private readonly dynamo: DynamoDB,
        private readonly uuid: () => string) {

    }

    async create(payload: UrlRecordPayload): Promise<UrlRecord> {
        const record: UrlRecord = {
            ...payload,
            createdAt: DateTime.utc(),
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
        if (result.Item) {
            return DynamoDB.Converter.unmarshall(result.Item) as UrlRecord;
        }
        throw new NotFoundError(`Item was not found: ${id}`);
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