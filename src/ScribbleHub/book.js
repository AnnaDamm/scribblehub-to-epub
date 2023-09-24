import fs from 'fs'
import path from 'path'
import { chapterLoadingFinished, ChapterLoadingFinishedEvent } from '../Events/chapter-loading-finished.ts'
import { chapterLoadingStarted, ChapterLoadingStartedEvent } from '../Events/chapter-loading-started.ts'
import { eventEmitter } from '../Events/event-emitter.ts'
import { MainPageLoaded, mainPageLoaded } from '../Events/main-page-loaded.ts'
import { AssetDownloader } from './asset-downloader.js'
import { BookMetadataModel } from '../book.metadata.model.ts'
import { Chapter } from './chapter.js'
import * as cheerio from 'cheerio'
import { throttleAll } from 'promise-throttle-all'

const allChaptersPath = '/wp-admin/admin-ajax.php'

/**
 * @property {URL} url
 * @property {Promise<Chapter[]>} chapters
 */
export class Book {
  /**
   * @param {URL} url
   * @param {string} cacheDir
   */
  constructor (url, cacheDir) {
    this.url = url
    this._cacheDir = cacheDir
  }

  /**
   * @returns {Promise<BookMetadataModel>}
   */
  async getBookMetaData () {
    if (this._bookMetaData === undefined) {
      this._bookMetaData = (async () => {
        const bookMetadata = new BookMetadataModel()
        await bookMetadata.load(this.url)
        eventEmitter.emit(mainPageLoaded, new MainPageLoaded(this))
        return bookMetadata
      })()
    }
    return this._bookMetaData
  }

  /**
   * @returns {Promise<string>}
   */
  async loadCover () {
    const bookMetaData = await this.getBookMetaData()
    return await this._assetDownloader.download(bookMetaData.coverUrl)
  }

  /**
   * @param {number} startWith
   * @param {number|undefined} endWith
   * @returns {Promise<Chapter[]>}
   */
  async loadChapters (startWith, endWith) {
    if (this.chapters === undefined) {
      this.chapters = (async () => {
        let chapterUrls = (await this.getChapterUrls())
        if (this._startingChapterUrl !== undefined) {
          startWith = chapterUrls.findIndex((url) => url.toString() === this._startingChapterUrl.toString()) + 1
        }
        chapterUrls = chapterUrls.slice(startWith - 1, endWith)

        const cacheDir = this.prepareCacheDir()

        eventEmitter.emit(chapterLoadingStarted, new ChapterLoadingStartedEvent(chapterUrls.length))
        const chapters = throttleAll(
          50,
          chapterUrls.map((url, index) =>
            async () => {
              const chapter = new Chapter(url, index + startWith, await cacheDir)
              await chapter.load(this._assetDownloader)
              return chapter
            }
          )
        )
        chapters.then((chapters) => {
          eventEmitter.emit(chapterLoadingFinished, new ChapterLoadingFinishedEvent(chapters))
        })
        return chapters
      })()
    }

    return this.chapters
  }

  /**
   * @private
   * @returns {Promise<URL[]>}
   */
  async getChapterUrls () {
    const response = await fetch(
      this.url.origin + allChaptersPath,
      {
        method: 'POST',
        body: new URLSearchParams({
          action: 'wi_getreleases_pagination',
          pagenum: -1,
          mypostid: (await this.getBookMetaData()).postId
        })
      }
    )
    const $ = cheerio.load(await response.text())
    return $('.toc_w')
      .map((i, node) => ({
        order: parseInt($(node).attr('order')),
        url: new URL($(node).find('.toc_a').attr('href'))
      }))
      .toArray()
      .sort((nodeA, nodeB) => Math.sign(nodeA.order - nodeB.order))
      .map((node) => node.url)
  }

  /**
   * @returns {Promise<string>}
   */
  async prepareCacheDir () {
    const directory = path.resolve(this._cacheDir, (await this.getBookMetaData()).slug)
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
    }
    return directory
  }

  /**
   * @return {Promise<void>}
   */
  async init () {
    if (this._isChapterUrl(this.url)) {
      this._startingChapterUrl = this.url

      const page = await fetch(this.url.toString())
      const $ = cheerio.load(await page.text())
      this.url = new URL($('.c_index a').attr('href'))
    } else if (!this._isMainUrl(this.url)) {
      throw Error('Not a valid scribblehub url')
    }
    this._assetDownloader = new AssetDownloader(this.prepareCacheDir())
  }

  /**
   * @param {URL} url
   * @return {boolean}
   * @private
   */
  _isChapterUrl (url) {
    return url.toString().match(/^https:\/\/www\.scribblehub\.com\/read\/.+\/chapter\/\d+\/$/) !== null
  }

  /**
   * @param {URL} url
   * @return {boolean}
   * @private
   */
  _isMainUrl (url) {
    return url.toString().match(/^https:\/\/www\.scribblehub\.com\/series\/\d+\/.+\/$/) !== null
  }
}
