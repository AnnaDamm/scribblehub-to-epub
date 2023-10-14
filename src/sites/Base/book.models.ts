export interface BookMetadata {
    canonicalUrl: URL,
    slug: string,
    title: string,
    coverUrl: URL,
    date: Date,
    description: string | null,
    authorName: string | null,
    publisher: string | null,
    details: string | null,
}

export interface Book {
    url: URL;
    chapters: Chapter[];
}

export interface Chapter {
    url: URL;
    index: number;
    title?: string | null;
    text?: string;
}