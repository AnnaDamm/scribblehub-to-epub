import { BaseEvent } from './base-event';

export const assetDownloadFinished = Symbol('assetDownloadFinished')

export class AssetDownloadFinishedEvent extends BaseEvent {
    constructor(public readonly url: URL, public readonly filePath: string) {
        super()
    }
}
