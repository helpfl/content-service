import Zod from 'zod';

export interface IContentQuery {
    getStart(): string;

    getEnd(): string;

    getPageNextToken(): string | undefined;
}

export class ContentQueryParseError extends Error {

    name = 'ContentQueryParseError';

    constructor(message: string) {
        super(message);
    }
}

//TODO: add Page Limit
export class ContentQuery implements IContentQuery {

    static parse(queryParams: unknown): IContentQuery | Error {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const schema = Zod.object({
            start: Zod.string().datetime().default(now.toISOString()),
            end: Zod.string().datetime().default(thirtyDaysAgo.toISOString()),
            pageNextToken: Zod.string().optional()
        }).nonstrict();
        const result = schema.safeParse(queryParams);
        if (result.success) {
            const {data: {start, end, pageNextToken}} = result;
            return new ContentQuery(start, end, pageNextToken);
        }
        return new ContentQueryParseError(result.error.message);
    }

    private constructor(
        private readonly start: string,
        private readonly end: string,
        private readonly pageNextToken?: string
    ) {
    }

    getPageNextToken(): string | undefined {
        return this.pageNextToken;
    }

    getStart(): string {
        return this.start;
    }

    getEnd(): string {
        return this.end;
    }

}
