import { CreateUrlHandler } from "./post-url-record-handler";
import { ConsoleLogger } from "./logger";
import { UrlRecordService } from "./url-record-service";
import {DynamoDB} from 'aws-sdk';
import { v4 } from 'uuid';
import { GetRecordHanlder } from "./get-record-handler";
import { UrlResolver } from "./url-resolver";
import { toDataURL } from "qrcode";

const logger = new ConsoleLogger();
const service = new UrlRecordService(new DynamoDB(), v4, toDataURL);

export const urlPostHandler = new CreateUrlHandler(logger, service).invoke;
export const urlPostPath = __filename;
export const urlPostHandlerName = 'urlPostHandler';

export const urlGetHandler = new GetRecordHanlder(service).invoke;
export const urlGetHandlerPath = __filename;
export const urlGetHandlerName = 'urlGetHandler';

export const urlResolverHandler = new UrlResolver(service).invoke;
export const urlResolverHandlerPath = __filename;
export const urlResolverHandlerName = 'urlResolverHandler';