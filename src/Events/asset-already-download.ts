import { BaseEvent } from './base-event.js'

export const assetAlreadyDownloaded = Symbol('assetAlreadyDownloaded')

export class AssetAlreadyDownloadedEvent extends BaseEvent {
    constructor(public readonly filePath: string) {
        super()
    }
}
