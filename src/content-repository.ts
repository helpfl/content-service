import * as Zod from 'zod';
import {DynamoDB, PutItemInput, QueryInput} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';

export class ContentRepository {
    constructor(private readonly dynamoDB: DynamoDB, private readonly uuid: () => string, ) {
    }
    
    public async fetchByDateRange(start: number, end: number): Promise<BlogPost[]> {
        const params: QueryInput = {
            TableName: 'BlogContent',
            IndexName: 'nameIndex',
            KeyConditionExpression: '#name = :name AND #date BETWEEN :start AND :end',
            ExpressionAttributeValues: marshall({
                ':start': start,
                ':end': end,
                ':name': 'test'
            }),
            ExpressionAttributeNames: {
                '#date': 'date',
                '#name': 'name'
            }
        };

        const result = await this.dynamoDB.query(params);
        const items = result.Items || [];
        return items.map(value => unmarshall(value)).filter(hasContent).sort((a, b) => b.date - a.date);
    }

    public async post(content: string): Promise<void> {
        const params: PutItemInput = {
            TableName: 'BlogContent',
            Item: marshall({
                date: Date.now(),
                content,
                id: this.uuid(),
                name: 'test'
            })
        };

        await this.dynamoDB.putItem(params);
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
