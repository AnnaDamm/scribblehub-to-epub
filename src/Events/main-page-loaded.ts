import { BookMetadata } from '../sites/Base/book.models.js';
import { BaseEvent } from './base-event.js'

export const mainPageLoaded = Symbol('mainPageLoaded')

export class MainPageLoaded extends BaseEvent {
    constructor(public readonly bookMetadata: BookMetadata) {
        super()
    }
}
