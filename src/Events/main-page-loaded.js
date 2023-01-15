import { BaseEvent } from './base-event.js'

export const mainPageLoaded = Symbol('mainPageLoaded')

export class MainPageLoaded extends BaseEvent {
  /**
   * @param {Book} book
   */
  constructor (book) {
    super()
    this.book = book
  }
}
