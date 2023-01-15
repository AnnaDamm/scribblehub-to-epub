import { BaseEvent } from './base-event.js'

export const chapterLoadingStarted = Symbol('chapterLoadingStarted')

export class ChapterLoadingStartedEvent extends BaseEvent {
  /**
   * @param {number} totalAmount
   */
  constructor (totalAmount) {
    super()
    this.totalAmount = totalAmount
  }
}
