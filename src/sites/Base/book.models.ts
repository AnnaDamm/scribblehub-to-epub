export interface BookMetadata {
    canonicalUrl: URL,
    slug: string,
    title: string,
    coverUrl: URL,
    date: Date,
    description: string,
    authorName: string,
    publisher: string,
    synopsis: string,
}

export interface Book {
    url: URL;
    getBookMetaData: () => Promise<BookMetadata>;
    getCover: () => Promise<string>;
    getChapters: () => Promise<Chapter[]>;
    getStyles: () => Promise<string>;
}

export interface Chapter {
    url: URL;
    index: number;
    title: string;
    text: string;

    load: () => Promise<Chapter>;
}