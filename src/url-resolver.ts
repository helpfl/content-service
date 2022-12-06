import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
import { NotFoundError, UrlRecordServiceInterface } from "./url-record-service";


export type ResolveRequest = {
    readonly pathParameters: {
        readonly id: string
    }
};

export class UrlResolver {

    constructor(
        private readonly urlRecordService: UrlRecordServiceInterface,
    ) {
        
    }

    invoke = async ({pathParameters: {id}}: ResolveRequest): Promise<APIGatewayProxyStructuredResultV2> => {
        try {
            const {redirectUrl} = await this.urlRecordService.getByUrl(`https://link.helpfl.click/${id}`);
            return {
                statusCode: 301,
                headers: {
                    Location: redirectUrl,
                }
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
    };
}