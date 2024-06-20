import { bookMetadataLoaded, BookMetadataLoadedEvent } from '../../Events/book-metadata-loaded';
import { eventEmitter } from '../../Events/event-emitter';
import { BookMetadata } from './book.models';

export abstract class MetadataLoader<MetaDataClass extends BookMetadata> {
    public async load(url: URL): Promise<MetaDataClass> {
        const bookMetaData = await this.loadData(url);
        eventEmitter.emit(bookMetadataLoaded, new BookMetadataLoadedEvent(bookMetaData))

        return bookMetaData;
    }

    protected abstract loadData(url: URL): Promise<MetaDataClass>;
}