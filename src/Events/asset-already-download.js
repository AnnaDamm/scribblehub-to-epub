import { BaseEvent } from './base-event.js'

export const assetAlreadyDownloaded = Symbol('assetAlreadyDownloaded')

/**
 * @property {string} filePath
 */
export class AssetAlreadyDownloadedEvent extends BaseEvent {
  /**
   * @param {string} filePath
   */
  constructor (filePath) {
    super()
    this.filePath = filePath
  }
}
