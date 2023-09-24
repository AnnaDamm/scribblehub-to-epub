import { BaseEvent } from './base-event.js';

export const assetDownloadFinished = Symbol('assetDownloadFinished')

export class AssetDownloadFinishedEvent extends BaseEvent {
    constructor(public readonly url: URL, public readonly filePath: string) {
        super()
    }
}
