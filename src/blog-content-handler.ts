import { APIGatewayProxyHandlerV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { BlogContentRepository } from './blog-content-repository';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {nanoid} from 'nanoid';

export class BlogContentHandler {

    constructor(private readonly blogContentRepository: BlogContentRepository) {}

    invoke: APIGatewayProxyHandlerV2 = async ({queryStringParameters}) => {
        if (!validRequest(queryStringParameters)) {
            return jsonResponse(400, {message: 'Invalid request'});
        }

        const content = await this.blogContentRepository.fetchByDateRange(Number(queryStringParameters.start), Number(queryStringParameters.end));
        return jsonResponse(200, content);
    }
}

const jsonResponse = (status: number, body: Json): APIGatewayProxyStructuredResultV2 => ({
    statusCode: status,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Headers': '*'
    },
    body: JSON.stringify(body)
});

type Json = string | number | boolean | null | Json[] | {[key: string]: Json};

const validRequest = (queryStringParameters: unknown): queryStringParameters is {start: string, end: string} => {
    return typeof queryStringParameters === 'object' && 
        queryStringParameters !== null && 
        'start' in queryStringParameters &&
        'end' in queryStringParameters;
};


const dynamoDb = new DynamoDB({});
const blogContentRepository = new BlogContentRepository(dynamoDb, nanoid);
export const handler = new BlogContentHandler(blogContentRepository).invoke;