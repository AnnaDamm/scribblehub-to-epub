import { BaseEvent } from './base-event.js'

export const bookMetadataLoaded = Symbol('bookMetadataLoaded')

/**
 * @property {BookMetadata} bookMetadata
 */
export class BookMetadataLoadedEvent extends BaseEvent {
  /**
   * @param {BookMetadata} bookMetadata
   */
  constructor (bookMetadata) {
    super()
    this.bookMetaData = bookMetadata
  }
}
