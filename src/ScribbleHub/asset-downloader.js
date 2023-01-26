import * as Parallel from 'async-parallel'
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import { assetAlreadyDownloaded, AssetAlreadyDownloadedEvent } from '../Events/asset-already-download.js'
import { assetDownloadFinished, AssetDownloadFinishedEvent } from '../Events/asset-download-finished.js'
import { assetDownloadStarted, AssetDownloadStartedEvent } from '../Events/asset-download-started.js'
import { eventEmitter } from '../Events/event-emitter.js'

export class AssetDownloader {
  /**
   * @param {Promise<string>} cacheDir
   */
  constructor (cacheDir) {
    this._cacheDir = cacheDir
  }

  /**
   * @param {Page} page
   * @param {string} selector
   * @returns {Promise<Array.<string>>} file paths
   */
  async fetchImagesFromQuery (page, selector) {
    const urls = await page.$$eval(
      selector,
      (images, cacheDir) =>
        images.map((image) => {
          const url = image.getAttribute('src')
          if (!url) {
            return [undefined, undefined]
          }

          const filePath = cacheDir + '/' + new URL(url).pathname.replace(/^\//, '')
          image.setAttribute('src', filePath)
          return [url, filePath]
        }),
      await this._cacheDir
    )

    return Parallel.map(
      urls.filter(([url, _]) => !!url),
      async ([url, filePath]) => {
        await this.download(new URL(url), filePath)
        return [url, filePath]
      }
    )
  }

  /**
   * @param {URL} url
   * @returns {Promise<string>}
   */
  async mapFilePath (url) {
    return path.resolve(await this._cacheDir, url.pathname.replace(/^\//, ''))
  }

  /**
   * @param {URL} url
   * @param {string} filePath
   * @returns {Promise<string>} file path
   */
  async download (url, filePath) {
    if (fs.existsSync(filePath)) {
      eventEmitter.emit(assetAlreadyDownloaded, new AssetAlreadyDownloadedEvent(filePath))
      return filePath
    }

    const dirName = path.dirname(filePath)
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
    }

    eventEmitter.emit(assetDownloadStarted, new AssetDownloadStartedEvent(url, filePath))
    await this.saveImageToDisk(url, filePath)
    eventEmitter.emit(assetDownloadFinished, new AssetDownloadFinishedEvent(url, filePath))

    return filePath
  }

  /**
   * @private
   * @param {URL} url
   * @param {string} filePath
   */
  async saveImageToDisk (url, filePath) {
    const response = await fetch(url.toString())
    const fileStream = fs.createWriteStream(filePath)
    await stream.promises.finished(stream.Readable.fromWeb(response.body).pipe(fileStream))
  }
}
