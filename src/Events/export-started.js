import { BaseEvent } from './base-event.js'

export const exportStarted = Symbol('exportStarted')

/**
 * @property {Book} book
 */
export class ExportStartedEvent extends BaseEvent {
  /**
   * @param {Book} book
   */
  constructor (book) {
    super()
    this.book = book
  }
}
