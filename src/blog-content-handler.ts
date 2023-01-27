import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { BlogContentRepository } from "./blog-content-repository";

export class BlogContentHandler {

    constructor(private readonly blogContentRepository: BlogContentRepository) {}

    invoke: APIGatewayProxyHandlerV2 = async ({queryStringParameters}) => {
        if (!validRequest(queryStringParameters)) {
            return {
                statusCode: 400,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: 'Invalid request'})
            };
        }

        const content = await this.blogContentRepository.fetchByDateRange(Number(queryStringParameters.start), Number(queryStringParameters.end));
        return {
            statusCode: 200,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(content)
        };
    }
}

const validRequest = (queryStringParameters: unknown): queryStringParameters is {start: string, end: string} => {
    return typeof queryStringParameters === 'object' && 
        queryStringParameters !== null && 
        'start' in queryStringParameters &&
        'end' in queryStringParameters;
};