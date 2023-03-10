import {IContent} from './content';
import {PaginatedList} from './pagination';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {marshall} from '@aws-sdk/util-dynamodb';

export interface IContentRepository {
  save(content: IContent): Promise<void>;
  listContent(start: string, end: string, pageNextToken?: string): Promise<PaginatedList<IContent>>;
}

export class ContentRepository implements IContentRepository {

  constructor(private readonly dynamoDb: Pick<DynamoDB, 'putItem'>) {
  }


  listContent(): Promise<PaginatedList<IContent>> {
    throw new Error('Not implemented');
  }

  async save(content: IContent): Promise<void> {
    const item = {
      text: content.getContent(),
      userId: content.getUserId(),
      date: content.getDate()
    };
    const id = item.userId + content.hash();
    const marshalled = marshall({
      ...item,
      id
    });
    const params = {
      TableName: 'Content',
      Item: marshalled
    };
    await this.dynamoDb.putItem(params);
  }
}
