import { Chapter } from '../sites/book.models.js';
import { BaseEvent } from './base-event.js'

export const chapterLoadingFinished = Symbol('chapterLoadingFinished')

export class ChapterLoadingFinishedEvent extends BaseEvent {
    constructor(public readonly chapters: Chapter[]) {
        super()
    }
}
