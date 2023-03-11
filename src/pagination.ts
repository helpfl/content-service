export type IPaginatedList<T> = {
    map<U>(mapper: (item: T) => U): IPaginatedList<U>;
    toJson(): string;
}

export class PaginatedList<T> implements IPaginatedList<T> {

    static fromArray<T>(array: T[], pageNextToken?: string): PaginatedList<T> {
        return new PaginatedList(array, pageNextToken);
    }

    private constructor(
        private readonly items: T[],
        private readonly pageNextToken?: string
    ) {
    }

    map<U>(mapper: (item: T) => U): PaginatedList<U> {
        return new PaginatedList(this.items.map(mapper), this.pageNextToken);
    }

    toJson(): string {
        return JSON.stringify({
            items: this.items,
            pageNextToken: this.pageNextToken,
            total: this.items.length
        });
    }
}
