import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda/trigger/api-gateway-proxy';
import {Content} from './content';
import {ContentRepository, IContentRepository} from './repository';
import {DynamoDB} from '@aws-sdk/client-dynamodb';
import {ContentQuery} from './content-query';

export class RestApiHandler {

    constructor(private readonly repository: IContentRepository) {
    }

    invoke = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        switch (event.httpMethod) {
            case 'POST':
                return this.post(event);
            default:
                return notFound();
        }
    }

    post = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        if (event.body === null) {
            return badRequest();
        }

        const content = Content.fromJson(event.body);
        if (content instanceof Error) {
            return unprocessableEntity(content.message);
        }

        await this.repository.save(content);
        return created();
    };

    get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
        const userID = event.headers['x-helpfl-user-id'];
        if (userID === undefined) {
            return badRequest();
        }
        const query = ContentQuery.parse(event.queryStringParameters || {});
        if (query instanceof Error) {
            return unprocessableEntity(query.message);
        }

        const content = await this.repository.listContent(userID, query);
        return ok(content);
    }

}

const ok = (json: object): APIGatewayProxyResult => {
    return {
        statusCode: 200,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(json)
    };
};

const created = (): APIGatewayProxyResult => {
    return {
        statusCode: 201,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: 'Created'})
    };
};

const notFound = (): APIGatewayProxyResult => {
    return {
        statusCode: 404,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: 'Not Found'})
    }
};

const badRequest = (): APIGatewayProxyResult => {
    return {
        statusCode: 400,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: 'Bad Request'})
    }
}

const unprocessableEntity = (message: string): APIGatewayProxyResult => {
    return {
        statusCode: 422,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message})
    }
}

const dynamoDbClient = new DynamoDB({});
const repository = new ContentRepository(dynamoDbClient);
export const handler = new RestApiHandler(repository).invoke;
