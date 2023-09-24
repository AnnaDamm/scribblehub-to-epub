import { Chapter } from '../sites/book.models.js';
import { BaseEvent } from './base-event.js'

export const chapterLoadedFromCache = Symbol('chapterLoadedFromCache')

export class ChapterLoadedFromCacheEvent extends BaseEvent {
    constructor(public readonly chapter: Chapter) {
        super()
    }
}
