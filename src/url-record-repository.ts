import {DynamoDB} from 'aws-sdk';
import { UrlRecord } from './url-record';

export type UrlRecordRepository = { 
    persist(record: UrlRecord): Promise<void>;
};

export class DynamoUrlRecordRepository implements UrlRecordRepository{
    constructor(private readonly table: DynamoDB) {
    }

    async persist(record: UrlRecord): Promise<void> {
        const serializedRecord = DynamoDB.Converter.marshall(record);
        await this.table.putItem({
            TableName: 'UrlTable',
            Item: serializedRecord
        }).promise();
    }
}

