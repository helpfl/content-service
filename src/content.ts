import {json} from './zod';
import zod from 'zod';
import * as lz from 'lz-string';
import {Serializable} from './serializable';

export interface IContent {
    getContent(): string;

    getUserId(): string;

    getDate(): string;

    hash(): string;
}

export class ContentParseError extends Error {

    name = 'ContentParseError';

    constructor(message: string) {
        super(message);
    }
}

export class Content implements IContent, Serializable {

    private static readonly jsonSchema = json({
        text: zod.string().min(1).max(1000),
        userId: zod.string().uuid(),
        date: zod.string().datetime()
    });

    static fromJson(json: string): Content | Error {
        const result = this.jsonSchema.safeParse(json);
        if (result.success) {
            const {data: {text, userId, date}} = result;
            return new Content(text, userId, date);
        }
        return new ContentParseError(result.error.message);
    }

    static fromProps(text: string, userId: string, date: string): Content {
        return new Content(text, userId, date);
    }

    private constructor(
        private readonly text: string,
        private readonly userId: string,
        private readonly date: string
    ) {
    }

    getContent(): string {
        return this.text;
    }

    getDate(): string {
        return this.date;
    }

    getUserId(): string {
        return this.userId;
    }

    toJson(): object {
        return {
            text: this.text,
            userId: this.userId,
            date: this.date
        };
    }

    hash(): string {
        const json = JSON.stringify(this.toJson());
        return lz.compressToBase64(json);
    }

}
