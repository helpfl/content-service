import { DynamoDB } from 'aws-sdk';
import { Converter, QueryInput } from 'aws-sdk/clients/dynamodb';
import * as Zod from 'zod';

export class BlogContentRepository {
    constructor(private readonly dynamoDB: DynamoDB, private readonly uuid: () => string, ) {
    }
    
    public async fetchByDateRange(start: number, end: number): Promise<BlogPost[]> {
        const params: QueryInput = {
            TableName: 'BlogContent',
            IndexName: 'nameIndex',
            KeyConditionExpression: '#name = :name AND #date BETWEEN :start AND :end',
            ExpressionAttributeValues: {
                ':start': {
                    N: start.toString()
                },
                ':end': {
                    N: end.toString()
                },
                ':name': {
                    S: 'test'
                }
            },
            ExpressionAttributeNames: {
                '#date': 'date',
                '#name': 'name'
            }
        };

        const result = await this.dynamoDB.query(params).promise();
        const items = result.Items || [];
        return items.map(value => Converter.unmarshall(value)).filter(hasContent).sort((a, b) => b.date - a.date);
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
                },
                name: {
                    S: 'test'
                }
            }
        };

        await this.dynamoDB.putItem(params).promise();
    }
}


const hasContent = (item: unknown): item is BlogPost => {
    const validation = blogPostValidation.safeParse(item);
    return validation.success;
};

export type BlogPost = Zod.infer<typeof blogPostValidation>;

const blogPostValidation = Zod.object({
    date: Zod.number(),
    content: Zod.string(),
    id: Zod.string(),
    name: Zod.string()
});
