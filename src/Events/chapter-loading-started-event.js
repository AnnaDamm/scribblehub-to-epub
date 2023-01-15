export const chapterLoadingStarted = Symbol('chapterLoadingStarted')

export class ChapterLoadingStartedEvent {
  /**
   * @param {number} totalAmount
   */
  constructor (totalAmount) {
    this.totalAmount = totalAmount
  }
}
