import { Chapter } from '../sites/Base/book.models';
import { BaseEvent } from './base-event'

export const chapterWrittenToCache = Symbol('chapterWrittenToCache')

export class ChapterWrittenToCacheEvent extends BaseEvent {
    constructor(public readonly chapter: Chapter) {
        super()
    }
}
