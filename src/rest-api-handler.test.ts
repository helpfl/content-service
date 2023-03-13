import {RestApiHandler} from './rest-api-handler';
import {APIGatewayProxyEvent} from 'aws-lambda/trigger/api-gateway-proxy';
import {Content} from './content';
import {PaginatedList} from './pagination';


describe('returns not found if the method is not POST', () => {
    test('PUT', async () => {
        const event = putRequest();

        const response = await handler.invoke(event);

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual(JSON.stringify({message: 'Not Found'}));
    });
});

describe('POST', () => {
    test('returns 201 OK', async () => {
        repository.save.mockResolvedValue(undefined);
        const event = validContentPostRequest();

        const response = await handler.invoke(event);

        expect(response.statusCode).toEqual(201);
        expect(response.body).toEqual(JSON.stringify({message: 'Created'}));
    });

    test('returns 422 when body is invalid', async () => {
        const event = validContentPostRequest({text: 'Hello World'});

        const response = await handler.invoke(event);

        expect(response.statusCode).toEqual(422);
    });
});

describe('GET', () => {


    [
        {
            name: 'returns 200 OK',
            page: PaginatedList.fromArray(
                [
                    Content.fromProps(
                        'Hello World',
                        '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                        '2020-01-01T00:00:00.000Z'
                    ),
                    Content.fromProps(
                        'blah blah',
                        '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                        '2020-01-01T00:00:00.000Z'
                    ),
                    Content.fromProps(
                        'FOO BAR',
                        '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                        '2020-01-01T00:00:00.000Z'
                    )
                ]
            ),
            event: validContentGetRequest({
                start: '2020-01-01T00:00:00.000Z',
                end: '2020-01-01T00:00:00.000Z'
            }),
            expected: expect.objectContaining({
                statusCode: 200,
                body: JSON.stringify({
                    total: 3,
                    items: [
                        {
                            text: 'Hello World',
                            userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                            date: '2020-01-01T00:00:00.000Z'
                        },
                        {
                            text: 'blah blah',
                            userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                            date: '2020-01-01T00:00:00.000Z'
                        },
                        {
                            text: 'FOO BAR',
                            userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                            date: '2020-01-01T00:00:00.000Z'
                        }
                    ]
                })
            })
        },
        {
            name: 'handles empty page',
            page: PaginatedList.fromArray([]),
            event: validContentGetRequest({
                start: '2020-01-01T00:00:00.000Z',
                end: '2020-01-01T00:00:00.000Z'
            }),
            expected: expect.objectContaining({
                statusCode: 200,
                body: JSON.stringify({
                    total: 0,
                    items: []
                })
            })
        },
        {
            name: 'handles page next tokens',
            page: PaginatedList.fromArray(
                [
                    Content.fromProps(
                        'Hello World',
                        '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                        '2020-01-01T00:00:00.000Z'
                    )
                ],
                'bar'
            ),
            event: validContentGetRequest({
                start: '2020-01-01T00:00:00.000Z',
                end: '2020-01-01T00:00:00.000Z',
                pageNextToken: 'foo'
            }),
            expected: expect.objectContaining({
                statusCode: 200,
                body: JSON.stringify({
                    total: 1,
                    items: [
                        {
                            text: 'Hello World',
                            userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
                            date: '2020-01-01T00:00:00.000Z'
                        }
                    ],
                    pageNextToken: 'bar'
                })
            })
        },
    ].forEach(({page, event, name, expected}) => {
        test(name, async () => {
            repository.listContent.mockResolvedValue(page);

            const response = await handler.invoke(event);

            expect(response).toEqual(expected);
        });
    });
});

const repository = {
    save: jest.fn(),
    listContent: jest.fn()
};

const handler = new RestApiHandler(repository);

function validContentPostRequest(body: unknown = validDummyBody): APIGatewayProxyEvent {
    return {
        body: JSON.stringify(body),
        httpMethod: 'POST',
        headers: {},
        pathParameters: null,
        queryStringParameters: null
    } as APIGatewayProxyEvent;
}

function validContentGetRequest(queryParams: Record<string, string>): APIGatewayProxyEvent {
    return {
        httpMethod: 'GET',
        headers: {
            'x-helpfl-user-id': '4a7ff0c7-fb20-44e5-bba5-f857f270616c'
        },
        pathParameters: null,
        queryStringParameters: queryParams
    } as unknown as APIGatewayProxyEvent;
}

function putRequest() {
    return {
        httpMethod: 'PUT',
        headers: {},
        pathParameters: null,
        queryStringParameters: null
    } as APIGatewayProxyEvent;
}

const validDummyBody = {
    text: 'Hello World',
    userId: '4a7ff0c7-fb20-44e5-bba5-f857f270616c',
    date: '2020-01-01T00:00:00.000Z'
};

