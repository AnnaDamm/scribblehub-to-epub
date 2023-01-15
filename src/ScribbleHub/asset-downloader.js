import fs from 'fs'
import path from 'path'
import stream from 'stream'
import { assetDownloadFinished, AssetDownloadFinishedEvent } from '../Events/asset-download-finished.js'
import { assetDownloadStarted, AssetDownloadStartedEvent } from '../Events/asset-download-started.js'
import { eventEmitter } from '../Events/event-emitter.js'
import { TempDirectoryCreated, tempDirectoryCreated } from '../Events/temp-directory-created.js'

/**
 * @property tempDirPath
 */
export class AssetDownloader {
  /**
   * @param {string} tempDir
   * @param {string} slug
   */
  constructor (tempDir, slug) {
    this.tempDirPath = this.createTempDir(tempDir, slug)
  }

  /**
   * @param {Page} page
   * @param {string} selector
   * @returns {string[]} file paths
   */
  async fetchImagesFromQuery (page, selector) {
    const urls = await page.$$eval(selector, (images) =>
      images.map((image) => image.getAttribute('src'))
    )
    return Promise.all(
      urls
        .filter((url) => !!url)
        .map(async (url) => [url, await this.download(new URL(url))])
    )
  }

  /**
   * @param {URL} url
   * @returns {Promise<string>} file path
   */
  async download (url) {
    const tmpDir = await this.tempDirPath
    const filePath = path.resolve(tmpDir, url.pathname.replace(/^\//, ''))
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

  /**
   * @param {string} value
   * @returns {string}
   * @private
   */
  normalizePath (value) {
    return path.sep === '\\' ? value.replace(/\\/g, '/') : value
  }

  /**
   * @param {string} tempDir
   * @param {string} slug
   * @returns {Promise<string>}
   */
  async createTempDir (tempDir, slug) {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }
    const tmpPath = await fs.promises.mkdtemp(path.resolve(tempDir, slug))
    eventEmitter.emit(tempDirectoryCreated, new TempDirectoryCreated(tmpPath))
    return tmpPath
  }
}
