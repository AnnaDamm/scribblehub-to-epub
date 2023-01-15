import { BaseEvent } from './base-event.js'

export const chapterLoaded = Symbol('chapterLoaded')

export class ChapterLoadedEvent extends BaseEvent {
  /**
   * @param {Chapter} chapter
   */
  constructor (chapter) {
    super()
    this.chapter = chapter
  }
}
