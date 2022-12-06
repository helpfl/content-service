import { CreateUrlHandler } from "./post-url-record-handler";
import { ConsoleLogger } from "./logger";
import { UrlRecordService } from "./url-record-service";
import { DynamoUrlRecordRepository } from "./url-record-repository";
import {DynamoDB} from 'aws-sdk';
import { v4 } from 'uuid';

const logger = new ConsoleLogger();
const repository = new DynamoUrlRecordRepository(new DynamoDB());
const service = new UrlRecordService(repository, v4);
export const urlPostHandler = new CreateUrlHandler(logger, service).invoke;
export const urlPostPath = __filename;
export const urlPostHandlerName = 'urlPostHandler';
