import { CreateUrlHandler } from "./post-url-record-handler";
import { ConsoleLogger } from "./logger";
import { UrlRecordService } from "./url-record-service";
import {DynamoDB} from 'aws-sdk';
import { v4 } from 'uuid';
import { GetRecordHanlder } from "./get-record-handler";
import { UrlResolver } from "./url-resolver";
import { toDataURL } from "qrcode";
import { BlogContentRepository } from "./blog-content-repository";
import { BlogContentHandler } from "./blog-content-handler";

const logger = new ConsoleLogger();
const dynamoDb = new DynamoDB();
const service = new UrlRecordService(dynamoDb, v4, toDataURL);

// TODO remove the stuff related to the URL handler
export const urlPostHandler = new CreateUrlHandler(logger, service).invoke;
export const urlPostPath = __filename;
export const urlPostHandlerName = 'urlPostHandler';

export const urlGetHandler = new GetRecordHanlder(service).invoke;
export const urlGetHandlerPath = __filename;
export const urlGetHandlerName = 'urlGetHandler';

export const urlResolverHandler = new UrlResolver(service).invoke;
export const urlResolverHandlerPath = __filename;
export const urlResolverHandlerName = 'urlResolverHandler';

// Blog stuff
const blogContentRepository = new BlogContentRepository(dynamoDb, v4);
export const blogContentHandler = new BlogContentHandler(blogContentRepository);
export const blogContentHandlerPath = __filename;
export const blogContentHandlerName = 'blogContentHandler';