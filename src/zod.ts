import * as zod from 'zod';

export function json<T extends zod.ZodRawShape>(schema: T) {
    return zod.string().transform(json => safeParseJson(json)).pipe(zod.object(schema));
}

function safeParseJson(json: string) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return undefined;
    }
}
