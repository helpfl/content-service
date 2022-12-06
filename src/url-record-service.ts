import { UrlRecord, UrlRecordPayload } from './url-record';
import { UrlRecordRepository } from './url-record-repository';
import {DateTime} from 'luxon';

export type UrlRecordServiceInterface = {
    create(payload: UrlRecordPayload): Promise<UrlRecord>;
}

export class UrlRecordService implements UrlRecordServiceInterface {

    constructor(
        private readonly repository: UrlRecordRepository, 
        private readonly uuid: () => string) {

    }

    async create(payload: UrlRecordPayload): Promise<UrlRecord> {
        const record: UrlRecord = {
            ...payload,
            createdAt: DateTime.utc(),
            id: this.uuid(),
            url: `https://helpfl.click/${(this.randomUrlPath())}`
        };
        await this.repository.persist(record);
        return record;
    }

    private randomUrlPath(): string {
        return Math.random().toString(32).substring(2, 5) + Math.random().toString(32).substring(2, 5);
    }
}
