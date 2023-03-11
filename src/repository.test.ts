import {Content, IContent} from './content';
import {ContentRepository} from './repository';

describe('save', () => {
  test('saves the content', async () => {
    const content = dummyContent();
    dynamo.putItem.mockResolvedValue({});

    await repository.save(content);

    expect(dynamo.putItem).toBeCalledWith({
      TableName: 'ContentTable',
      Item: {
        text: {S: 'Hello World'},
        userId: {S: '4a7ff0c7-fb20-44e5-bba5-f857f270616c'},
        date: {S: '2020-01-01T00:00:00.000Z'},
        id: {
          S: '4a7ff0c7-fb20-44e5-bba5-f857f270616c#N4Ig' +
              'LgpgHmIFwgBIQDYoPYAIDq6BOKAJiADQgCuAzhHg' +
              'JLEIAsAhgOwBm7ADAMasC07AEYAmLv0aMIAVn5Ch' +
              'zWewAc0jiNZcAbAEYtPUiELNI8EGLH8uOqzoAq' +
              'XLnEfOuAOkdcAWiAC+QA=='
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

const repository = new ContentRepository(dynamo);

const dummyContent = (): IContent => {
  const content = Content.fromJson(JSON.stringify({
    text: 'Hello World',
    userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
    date: '2020-01-01T00:00:00.000Z'
  })) as IContent;
  expect(content).toBeInstanceOf(Content);
  return content;
};
