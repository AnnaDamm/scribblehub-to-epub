import fs from 'fs'
import path from 'path'
import { chapterLoadingFinished, ChapterLoadingFinishedEvent } from '../Events/chapter-loading-finished.js'
import { chapterLoadingStarted, ChapterLoadingStartedEvent } from '../Events/chapter-loading-started.js'
import { eventEmitter } from '../Events/event-emitter.js'
import { MainPageLoaded, mainPageLoaded } from '../Events/main-page-loaded.js'
import { AssetDownloader } from './asset-downloader.js'
import { BookMetadata } from './book-metadata.js'
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
    this._assetDownloader = new AssetDownloader(this.prepareCacheDir())
  }

  /**
   * @returns {Promise<BookMetadata>}
   */
  async getBookMetaData () {
    if (this._bookMetaData === undefined) {
      this._bookMetaData = (async () => {
        const bookMetadata = new BookMetadata()
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
        const chapterUrls = (await this.getChapterUrls()).slice(startWith - 1, endWith)

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
}
