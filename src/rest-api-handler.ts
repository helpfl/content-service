import { APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export class RestApiHandler {

    invoke = (): Promise<APIGatewayProxyStructuredResultV2> => {
        return Promise.resolve({
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({content: '# Hello World'})
        });
    }
}

export const handler = new RestApiHandler().invoke;
