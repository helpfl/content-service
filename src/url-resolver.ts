import { APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export class UrlResolver {
    invoke = async (): Promise<APIGatewayProxyStructuredResultV2> => {
        return {
            statusCode: 301,
            headers: {
              Location: 'https://google.com',
            }
          };
    };
}