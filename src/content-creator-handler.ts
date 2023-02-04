import { BlogContentRepository } from "./blog-content-repository";

export class ContentCreatorHandler {

    constructor(private readonly blogContentRepository: BlogContentRepository) {}

    invoke: () => Promise<void> = async () => {
        await this.blogContentRepository.post('test');
    }
}