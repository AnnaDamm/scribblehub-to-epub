import * as Parallel from 'async-parallel'
import fs from 'fs'
import path from 'path'
import stream from 'stream'
import { assetDownloadFinished, AssetDownloadFinishedEvent } from '../Events/asset-download-finished.js'
import { assetDownloadStarted, AssetDownloadStartedEvent } from '../Events/asset-download-started.js'
import { eventEmitter } from '../Events/event-emitter.js'
import { TempDirectoryCreated, tempDirectoryCreated } from '../Events/temp-directory-created.js'
import exitHook from 'async-exit-hook'

/**
 * @property {string} tempDirPath
 */
export class AssetDownloader {
  /**
   * @param {string} tempDir
   * @param {string} slug
   */
  constructor (tempDir, slug) {
    this.tempDirPath = this.createTempDir(tempDir, slug)
    exitHook(() => {
      fs.rmSync(this.tempDirPath, { recursive: true, maxRetries: 5 })
    })
  }

  /**
   * @param {Page} page
   * @param {string} selector
   * @returns {Promise<Array.<string>>} file paths
   */
  async fetchImagesFromQuery (page, selector) {
    const urls = await page.$$eval(
      selector,
      (images, tempDirPath) =>
        images.map((image) => {
          const url = image.getAttribute('src')
          if (!url) {
            return [undefined, undefined]
          }

          const filePath = tempDirPath + '/' + new URL(url).pathname.replace(/^\//, '')
          image.setAttribute('src', filePath)
          return [url, filePath]
        }),
      this.tempDirPath
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
   * @returns {string}
   */
  mapFilePath (url) {
    return path.resolve(this.tempDirPath, url.pathname.replace(/^\//, ''))
  }

  /**
   * @param {URL} url
   * @param {string} filePath
   * @returns {Promise<string>} file path
   */
  async download (url, filePath) {
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
  createTempDir (tempDir, slug) {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir)
    }
    const tmpPath = fs.mkdtempSync(path.resolve(tempDir, slug))
    eventEmitter.emit(tempDirectoryCreated, new TempDirectoryCreated(tmpPath))
    return tmpPath
  }
}
