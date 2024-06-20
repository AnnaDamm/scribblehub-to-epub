import { BookMetadata } from '../sites/Base/book.models';
import { BaseEvent } from './base-event'

export const bookMetadataLoaded = Symbol('bookMetadataLoaded')

export class BookMetadataLoadedEvent extends BaseEvent {
    constructor(public readonly bookMetadata: BookMetadata) {
        super()
    }
}
