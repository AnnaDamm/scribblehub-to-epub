import { BaseEvent } from './base-event'

export const chapterLoadingStarted = Symbol('chapterLoadingStarted')

export class ChapterLoadingStartedEvent extends BaseEvent {
    constructor(public readonly totalAmount: number) {
        super()
    }
}
