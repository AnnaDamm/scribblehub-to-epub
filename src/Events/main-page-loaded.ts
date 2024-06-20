import { BookMetadata } from '../sites/Base/book.models';
import { BaseEvent } from './base-event'

export const mainPageLoaded = Symbol('mainPageLoaded')

export class MainPageLoaded extends BaseEvent {
    constructor(public readonly bookMetadata: BookMetadata) {
        super()
    }
}
