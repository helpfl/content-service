import {json} from './zod';
import zod from 'zod';
import * as crypto from 'crypto';

export interface IContent {
  getContent(): string;
  getUserId(): string;
  getDate(): string;
  toJson(): string;
  hash(): string;
}

export class ContentParseError extends Error {

  name = 'ContentParseError';

  constructor(message: string) {
    super(message);
  }
}

export class Content implements IContent {

  private static readonly jsonSchema = json({
    text: zod.string().min(1).max(1000),
    userId: zod.string().uuid(),
    date: zod.string().datetime()
  });

  static fromJson(json: string): IContent | ContentParseError {
    const result = this.jsonSchema.safeParse(json);
    if (result.success) {
      const {data: {text, userId, date}} = result
      return new Content(text, userId, date);
    }
    return new ContentParseError(result.error.message);
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

  toJson(): string {
    return JSON.stringify({
      text: this.text,
      userId: this.userId,
      date: this.date
    });
  }

  hash(): string {
    const json = this.toJson();
    return crypto.createHash('sha256').update(json).digest('hex');
  }


}
