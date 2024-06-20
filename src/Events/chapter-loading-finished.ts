import { Chapter } from '../sites/Base/book.models';
import { BaseEvent } from './base-event'

export const chapterLoadingFinished = Symbol('chapterLoadingFinished')

export class ChapterLoadingFinishedEvent extends BaseEvent {
    constructor(public readonly chapters: Chapter[]) {
        super()
    }
}
