import { BlogContentRepository } from "./blog-content-repository";
import { ContentCreator } from "./content-creator";

export class ContentCreatorHandler {

    constructor(
        private readonly blogContentRepository: BlogContentRepository,
        private readonly contentCreator: ContentCreator
    ) {}

    invoke: () => Promise<void> = async () => {
        const content = await this.contentCreator.create();
        await this.blogContentRepository.post(content);
    }
}