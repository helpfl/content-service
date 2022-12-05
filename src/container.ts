import { CreateUrlHandler } from "./create-url/create-url-handler-handler";
import { ConsoleLogger } from "./logger";

const logger = new ConsoleLogger();

export const urlPostHandler = new CreateUrlHandler(logger).invoke;
export const urlPostPath = __filename;
export const urlPostHandlerName = 'urlPostHandler';
