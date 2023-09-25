import fs from 'fs'
import path from 'path'
import { fileCache } from '../../Cache/file-cache.js'
import { chapterLoadedFromCache, ChapterLoadedFromCacheEvent } from '../../Events/chapter-loaded-from-cache.js'
import { chapterLoaded, ChapterLoadedEvent } from '../../Events/chapter-loaded.js'
import { chapterWrittenToCache, ChapterWrittenToCacheEvent } from '../../Events/chapter-written-to-cache.js'
import { eventEmitter } from '../../Events/event-emitter.js'
import * as cheerio from 'cheerio'
import { cleanContents } from '../../Cheerio/clean-contents.js'

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
    let tries = 0
    let $
    do {
      const response = await fetch(this.url.toString())
      $ = cheerio.load(await response.text())
      this.title = $('.chapter-title').text()
    } while (!this.title && tries++ < 3)

    if (!this.title) {
      throw new Error(`Could not download chapter ${this.url.toString()}`)
    }

    await assetDownloader.fetchImagesFromQuery($, '#chp_contents img[src]')
    this.text = cleanContents($('#chp_raw')).html()
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

      if (!data.url || !data.index || !data.title || !data.text) {
        return false
      }
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
