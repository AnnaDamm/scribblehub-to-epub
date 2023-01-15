import { BaseEvent } from './base-event.js'

export const assetDownloadFinished = Symbol('assetDownloadFinished')

/**
 * @property {URL} url
 * @property {string} filePath
 */
export class AssetDownloadFinishedEvent extends BaseEvent {
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
