import {Serializable} from './serializable';

export class PaginatedList<T extends Serializable> implements Serializable {

    static fromArray<T extends Serializable>(array: T[], pageNextToken?: string): Serializable {
        return new PaginatedList(array, pageNextToken);
    }

    private constructor(
        private readonly items: T[],
        private readonly pageNextToken?: string
    ) {
    }

    toJson(): object {
        return {
            total: this.items.length,
            items: this.items.map(item => item.toJson()),
            pageNextToken: this.pageNextToken
        };
    }
}
