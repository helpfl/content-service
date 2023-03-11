import {RestApiHandler} from './rest-api-handler';
import {APIGatewayProxyEvent} from 'aws-lambda/trigger/api-gateway-proxy';


describe('returns not found if the method is not POST', () => {
    test('PUT', async () => {
        const event = putRequest();

        const response = await handler.invoke(event);

        expect(response.statusCode).toEqual(404);
        expect(response.body).toEqual(JSON.stringify({message: 'Not Found'}));
    });
});

describe('POST', () => {
    test('returns 200 OK', async () => {
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

