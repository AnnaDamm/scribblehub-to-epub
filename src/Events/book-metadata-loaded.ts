import { BookMetadata } from '../sites/Base/book.models.js';
import { BaseEvent } from './base-event.js'

export const bookMetadataLoaded = Symbol('bookMetadataLoaded')

export class BookMetadataLoadedEvent extends BaseEvent {
    constructor(public readonly bookMetadata: BookMetadata) {
        super()
    }
}
