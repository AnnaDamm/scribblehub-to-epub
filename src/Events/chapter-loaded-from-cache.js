import { BaseEvent } from './base-event.js'

export const chapterLoadedFromCache = Symbol('chapterLoadedFromCache')

/**
 * @property {Chapter} chapter
 */
export class ChapterLoadedFromCacheEvent extends BaseEvent {
  /**
   * @param {Chapter} chapter
   */
  constructor (chapter) {
    super()
    this.chapter = chapter
  }
}
