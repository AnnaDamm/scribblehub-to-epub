import fs from 'fs'
import path from 'path'
import { fileCache } from '../Cache/file-cache.js'
import { chapterLoadedFromCache, ChapterLoadedFromCacheEvent } from '../Events/chapter-loaded-from-cache.js'
import { chapterLoaded, ChapterLoadedEvent } from '../Events/chapter-loaded.js'
import { chapterWrittenToCache, ChapterWrittenToCacheEvent } from '../Events/chapter-written-to-cache.js'
import { eventEmitter } from '../Events/event-emitter.js'

/**
 * @property {URL} url
 * @property {string} title
 * @property {string} text
 * @property {number} id
 * @property {number} index
 */
export class Chapter {
  /**
   * @param {URL} url
   * @param {number} index
   * @param {string} cacheDir
   */
  constructor (url, index, cacheDir) {
    this.url = url
    this.index = index
    this._cacheDir = cacheDir
  }

  /**
   * @returns {number}
   */
  get id () {
    return parseInt(this.url.pathname.match(/chapter\/(?<id>\d+)\/?/).groups.id)
  }

  /**
   * @param {AssetDownloader} assetDownloader
   * @returns {Promise<void>}
   */
  async load (assetDownloader) {
    if (!this._loadFromCache()) {
      await this._loadFromWeb(assetDownloader)
      this._writeToCache()
    }

    eventEmitter.emit(chapterLoaded, new ChapterLoadedEvent(this))
  }

  /**
   * @param {AssetDownloader} assetDownloader
   * @returns {Promise<void>}
   */
  async _loadFromWeb (assetDownloader) {
    const response = await fetch(this.url.toString())
    const page = await Browser.newPage()
    await page.setContent(await response.text())
    await assetDownloader.fetchImagesFromQuery(page, '#chp_contents img[src]')
    await Parallel.invoke([
      async () => { this.title = await page.$eval('.chapter-title', (node) => node.innerHTML) },
      async () => {
        await page.$$eval('[class^="ad_"]', (nodes) => nodes.forEach((node) => node.remove()))
        this.text = await page.$eval('#chp_raw', (node) => node.innerHTML)
      }
    ])
    await page.close()
  }

  /**
   * @return {boolean}
   * @private
   */
  _loadFromCache () {
    if (!fs.existsSync(this._cacheFilePath)) {
      return false
    }

    try {
      const data = JSON.parse(fileCache.readString(this._cacheFilePath))

      this.url = new URL(data.url)
      this.index = data.index
      this.title = data.title
      this.text = data.text

      eventEmitter.emit(chapterLoadedFromCache, new ChapterLoadedFromCacheEvent(this))
      return true
    } catch {
      return false
    }
  }

  /**
   * @returns {void}
   * @private
   */
  _writeToCache () {
    fileCache.writeString(this._cacheFilePath, JSON.stringify({
      url: this.url.toString(),
      index: this.index,
      title: this.title,
      text: this.text
    }))
    eventEmitter.emit(chapterWrittenToCache, new ChapterWrittenToCacheEvent(this))
  }

  /**
   * @returns {string}
   * @private
   */
  get _cacheFilePath () {
    return path.resolve(this._cacheDir, this.id + '.json.brotli')
  }
}
