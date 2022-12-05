import { CreateUrlHandler } from "./create-url-handler-handler";

const logger = {log: jest.fn()};

test('Logs hello world', async () => {
    const handler = new CreateUrlHandler(logger);

    await handler.invoke();
    
    expect(logger.log).toHaveBeenCalledWith('Hello World');
});

test('returns 200 Hello World', async () => {
    const handler = new CreateUrlHandler(logger);

    const response = await handler.invoke();
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toBe("{\"hello\":\"World\"}");
});

