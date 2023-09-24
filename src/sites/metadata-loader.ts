import { bookMetadataLoaded, BookMetadataLoadedEvent } from '../Events/book-metadata-loaded.js';
import { eventEmitter } from '../Events/event-emitter.js';
import { BookMetadata } from './book.models.js';

export abstract class MetadataLoader {
    public async load(url: URL): Promise<BookMetadata> {
        const bookMetaData = await this.loadData(url);
        eventEmitter.emit(bookMetadataLoaded, new BookMetadataLoadedEvent(bookMetaData))

        return bookMetaData;
    }

    protected abstract loadData(url: URL): Promise<BookMetadata>;
}