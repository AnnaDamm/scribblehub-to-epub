export const chapterLoaded = Symbol('chapterLoaded')

export class ChapterLoadedEvent {
  /**
   * @param {Chapter} chapter
   */
  constructor (chapter) {
    this.chapter = chapter
  }
}
