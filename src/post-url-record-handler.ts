import { Logger } from './logger';
import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { UrlRecordServiceInterface } from './url-record-service';

export class CreateUrlHandler {

    constructor(
        private readonly logger: Logger,
        private readonly urlRecordService: UrlRecordServiceInterface,
    ) {
    }

    invoke = async (
        {body}: Pick<APIGatewayProxyEvent, 'body'>
    ): Promise<APIGatewayProxyStructuredResultV2> => {
        this.logger.log(body || 'no body');
        const payload = JSON.parse(body || '{}'); // TODO: remove conditional
        const record = await this.urlRecordService.create(payload);
        return {
            statusCode: 201,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(record)
        };
    }
}