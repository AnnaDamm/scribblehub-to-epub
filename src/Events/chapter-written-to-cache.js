import { BaseEvent } from './base-event.js'

export const chapterWrittenToCache = Symbol('chapterWrittenToCache')

/**
 * @property {Chapter} chapter
 */
export class ChapterWrittenToCacheEvent extends BaseEvent {
  /**
   * @param {Chapter} chapter
   */
  constructor (chapter) {
    super()
    this.chapter = chapter
  }
}
