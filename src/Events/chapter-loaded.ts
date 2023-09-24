import { Chapter } from '../sites/book.models.js';
import { BaseEvent } from './base-event.js';

export const chapterLoaded = Symbol('chapterLoaded')

export class ChapterLoadedEvent extends BaseEvent {
    constructor(public readonly chapter: Chapter) {
        super()
    }
}
