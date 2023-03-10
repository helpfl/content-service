export type PaginatedList<T> = {
    items: T[];
    pageNextToken?: string;
    total: number;
}

export function mapPaginatedList<T, U>(list: PaginatedList<T>, mapper: (item: T) => U): PaginatedList<U> {
    return {
        items: list.items.map(mapper),
        pageNextToken: list.pageNextToken,
        total: list.total
    }
}
