import { chapterLoaded, ChapterLoadedEvent } from '../Events/chapter-loaded.js'
import { eventEmitter } from '../Events/event-emitter.js'

/**
 * @property {string} title
 * @property {string} text
 */
export class Chapter {
  /**
   * @param {URL} url
   * @returns {Promise<void>}
   */
  async load (url) {
    eventEmitter.emit(chapterLoaded, new ChapterLoadedEvent(this))
  }
}
