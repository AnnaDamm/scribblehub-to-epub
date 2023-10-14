import { BaseEvent } from './base-event.js'

export const chapterLoadingStarted = Symbol('chapterLoadingStarted')

export class ChapterLoadingStartedEvent extends BaseEvent {
    constructor(public readonly totalAmount: number) {
        super()
    }
}
