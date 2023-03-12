import {Content, IContent} from './content';
import {ContentRepository} from './repository';

describe('save', () => {
    test('saves the content', async () => {
        const content = dummyContent();
        dynamo.putItem.mockResolvedValue({});

        await repository.save(content);

        expect(dynamo.putItem).toBeCalledWith({
            TableName: 'ContentTable-test',
            Item: {
                text: {S: 'Hello World'},
                userId: {S: '4a7ff0c7-fb20-44e5-bba5-f857f270616c'},
                date: {S: '2020-01-01T00:00:00.000Z'},
                id: {
                    S: 'N4IgLgpgHmIFwgBIQDYoPYAIDq6BOKA' +
                        'JiADQgCuAzhHgJLEIAsAhgOwBm7ADA' +
                        'MasC07AEYAmLv0aMIAVn5ChzWewAc0' +
                        'jiNZcAbAEYtPUiELNI8EGLH8uOqzoA' +
                        'qXLnEfOuAOkdcAWiAC+QA=='
                }
            }
        });
    });
});

describe('find', () => {
    test('returns the content', async () => {
        // TODO: Implement
    });
});

const dynamo = {putItem: jest.fn(), query: jest.fn()};

const repository = new ContentRepository(dynamo, 'test');

const dummyContent = (): IContent => {
    const content = Content.fromJson(JSON.stringify({
        text: 'Hello World',
        userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
        date: '2020-01-01T00:00:00.000Z'
    })) as IContent;
    expect(content).toBeInstanceOf(Content);
    return content;
};
