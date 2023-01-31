import { DynamoDB } from 'aws-sdk';
import { QueryInput } from 'aws-sdk/clients/dynamodb';

export class BlogContentRepository {
    constructor(private readonly dynamoDB: DynamoDB, private readonly uuid: () => string, ) {
    }
    
    public async fetchByDateRange(start: number, end: number): Promise<string[]> {
        const params: QueryInput = {
            TableName: 'BlogContent',
            IndexName: 'nameIndex',
            KeyConditionExpression: 'name = #name AND #date BETWEEN :start AND :end',
            ExpressionAttributeValues: {
                ':start': {
                    N: start.toString()
                },
                ':end': {
                    N: end.toString()
                }
            },
            ExpressionAttributeNames: {
                '#date': 'date',
                '#name': 'test'
            }
        };

        const result = await this.dynamoDB.query(params).promise();
        const items = result.Items || [];
        return items.filter(hasContent).map(item => item.content.S);
    }

    public async post(content: string): Promise<void> {
        const params: DynamoDB.PutItemInput = {
            TableName: 'BlogContent',
            Item: {
                date: {
                    N: Date.now().toString()
                },
                content: {
                    S: content
                },
                id: {
                    S: this.uuid()
                }
            }
        };

        await this.dynamoDB.putItem(params).promise();
    }
}

const hasContent = (item: DynamoDB.AttributeMap): item is ItemWithContent => {
    return item?.content.S !== undefined;
};

type ItemWithContent = {content: {S: string}};