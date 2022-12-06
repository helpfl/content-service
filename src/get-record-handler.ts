import { APIGatewayProxyEvent, APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { NotFoundError, UrlRecordServiceInterface } from "./url-record-service";

export type GetRecordRequest = {
    readonly pathParameters: {
        readonly id: string
    }
};

export class GetRecordHanlder {

    constructor(
        private readonly urlRecordService: UrlRecordServiceInterface,
    ) {}

    invoke = async (
        {pathParameters: {id}}: GetRecordRequest
    ): Promise<APIGatewayProxyStructuredResultV2> => {
        try {
            const record = await this.urlRecordService.getById(id);
            return {
                statusCode: 200,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(record)
            };
        } catch (e: unknown) {
            if  (e instanceof NotFoundError) {
                return {
                    statusCode: 404,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({message: e.message})
                };
            }
            throw e;
        }
    }
}
