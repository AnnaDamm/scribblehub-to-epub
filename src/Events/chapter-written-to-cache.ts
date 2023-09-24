import { Chapter } from '../sites/book.models.js';
import { BaseEvent } from './base-event.js'

export const chapterWrittenToCache = Symbol('chapterWrittenToCache')

export class ChapterWrittenToCacheEvent extends BaseEvent {
    constructor(public readonly chapter: Chapter) {
        super()
    }
}
