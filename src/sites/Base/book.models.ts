export interface BookMetadata {
    canonicalUrl: URL,
    slug: string,
    title: string,
    coverUrl: URL,
    date: Date,
    description: string,
    authorName: string,
    publisher: string,
    details: string,
}

export interface Book {
    url: URL;
    getBookMetaData: () => Promise<BookMetadata>;
    getCover: () => Promise<string>;
    getChapters: () => Promise<Chapter[]>;
}

export interface Chapter {
    url: URL;
    index: number;
    title: string;
    text: string;

    load: () => Promise<Chapter>;
}