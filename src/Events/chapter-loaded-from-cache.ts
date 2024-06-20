import { Chapter } from '../sites/Base/book.models';
import { BaseEvent } from './base-event'

export const chapterLoadedFromCache = Symbol('chapterLoadedFromCache')

export class ChapterLoadedFromCacheEvent extends BaseEvent {
    constructor(public readonly chapter: Chapter) {
        super()
    }
}
