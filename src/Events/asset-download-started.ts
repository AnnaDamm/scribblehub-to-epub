import { BaseEvent } from './base-event.js'

export const assetDownloadStarted = Symbol('assetDownloadStarted')

export class AssetDownloadStartedEvent extends BaseEvent {
    constructor(public readonly url: URL, public readonly filePath: string) {
        super()
    }
}
