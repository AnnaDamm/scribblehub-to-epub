import { BaseEvent } from './base-event.js'

export const chapterLoadingFinished = Symbol('chapterLoadingFinished')

/**
 * @property {Chapter[]} chapters
 */
export class ChapterLoadingFinishedEvent extends BaseEvent {
  /**
   * @param {Chapter[]} chapters
   */
  constructor (chapters) {
    super()
    this.chapters = chapters
  }
}
