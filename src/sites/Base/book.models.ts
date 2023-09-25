export interface BookMetadata {
    readonly canonicalUrl: URL,
    readonly slug: string,
    readonly title: string,
    readonly coverUrl: URL,
    readonly date: Date,
    readonly description: string | null,
    readonly authorName: string | null,
    readonly publisher: string | null,
    readonly details: string | null,
}

export interface Book {
    readonly url: URL;
    readonly chapters: Chapter[];
}

export interface Chapter {
    readonly url: URL;
    readonly title: string | null;
    readonly text: string;
    readonly index: number;
}