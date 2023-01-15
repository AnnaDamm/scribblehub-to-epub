import { BaseEvent } from './base-event.js'

export const assetDownloadStarted = Symbol('assetDownloadStarted')

/**
 * @property {URL} url
 * @property {string} filePath
 */
export class AssetDownloadStartedEvent extends BaseEvent {
  /**
   * @param {URL} url
   * @param {string} filePath
   */
  constructor (url, filePath) {
    super()
    this.url = url
    this.filePath = filePath
  }
}
