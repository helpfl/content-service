import {Content, IContent} from './content';
import {PaginatedList} from './pagination';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';
import {IContentQuery} from './content-query';
import * as lz from 'lz-string';

export interface IContentRepository {
    save(content: IContent): Promise<void>;
    listContent(userId: string, contentQuery: IContentQuery): Promise<PaginatedList<IContent>>;
}

export class ContentRepository implements IContentRepository {

    constructor(private readonly dynamoDb: Pick<DynamoDB, 'putItem' | 'query'>) {
    }

    async listContent(userId: string, contentQuery: IContentQuery): Promise<PaginatedList<IContent>> {
        const pageNextToken = contentQuery.getPageNextToken();
        const startKey = pageNextToken && lz.decompressFromBase64(pageNextToken);
        const marshallStartKey = startKey ? marshall({id: startKey}) : undefined;
        const params = {
            TableName: 'ContentTable',
            KeyConditionExpression: '#id contains :userId AND #date BETWEEN :start AND :end',
            ExclusiveStartKey: marshallStartKey,
            ExpressionAttributeValues: {
                ':userId': {S: userId},
                ':start': {S: contentQuery.getStart()},
                ':end': {S: contentQuery.getEnd()}
            },
            ExpressionAttributeNames: {
                '#id': 'id',
                '#date': 'date'
            }
        };
        const {Items, LastEvaluatedKey} = await this.dynamoDb.query(params);
        const items = Items || [];
        const contentItems = items.map(item => {
            const {text, date, userId} = unmarshall(item);
            return Content.fromProps(text, userId, date);
        });
        const lastId = LastEvaluatedKey && unmarshall(LastEvaluatedKey).id.S;
        const nextPageToken = lastId ? lz.compressToBase64(lastId): undefined;
        return PaginatedList.fromArray(contentItems, nextPageToken);
    }

    async save(content: IContent): Promise<void> {
        const item = {
            text: content.getContent(),
            userId: content.getUserId(),
            date: content.getDate()
        };
        const marshalled = marshall({
            ...item,
            id: this.createId(content.getUserId(), content.hash())
        });
        const params = {
            TableName: 'ContentTable',
            Item: marshalled
        };
        await this.dynamoDb.putItem(params);
    }

    private createId(userId: string, date: string): string {
        return `${userId}#${date}`;
    }
}
