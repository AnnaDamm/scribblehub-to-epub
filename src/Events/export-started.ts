import { Book } from '../sites/Base/book.models';
import { BaseEvent } from './base-event'

export const exportStarted = Symbol('exportStarted')

export class ExportStartedEvent extends BaseEvent {
  constructor (public readonly book: Book) {
    super()
  }
}
