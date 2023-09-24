import { Book } from '../sites/book.models.js';
import { BaseEvent } from './base-event.js'

export const mainPageLoaded = Symbol('mainPageLoaded')

export class MainPageLoaded extends BaseEvent {
    constructor(public readonly book: Book) {
        super()
    }
}
