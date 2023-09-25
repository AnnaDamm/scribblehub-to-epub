import { Book } from '../sites/Base/book.models.js';
import { BaseEvent } from './base-event.js'

export const exportStarted = Symbol('exportStarted')

export class ExportStartedEvent extends BaseEvent {
  constructor (public readonly book: Book) {
    super()
  }
}
