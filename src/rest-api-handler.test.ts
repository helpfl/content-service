import {RestApiHandler} from './rest-api-handler';

test('returns 200 Hello World', async () => {
    const handler = new RestApiHandler();

    const response = await handler.invoke();
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe(JSON.stringify({content: '# Hello World'}));
});

