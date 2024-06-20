import { Chapter } from '../sites/Base/book.models';
import { BaseEvent } from './base-event';

export const chapterLoaded = Symbol('chapterLoaded')

export class ChapterLoadedEvent extends BaseEvent {
    constructor(public readonly chapter: Chapter) {
        super()
    }
}
