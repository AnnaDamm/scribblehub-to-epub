import fs from 'fs'
import path from 'path'
import { chapterLoadingFinished, ChapterLoadingFinishedEvent } from '../Events/chapter-loading-finished.js'
import { chapterLoadingStarted, ChapterLoadingStartedEvent } from '../Events/chapter-loading-started.js'
import { eventEmitter } from '../Events/event-emitter.js'
import { MainPageLoaded, mainPageLoaded } from '../Events/main-page-loaded.js'
import { AssetDownloader } from './asset-downloader.js'
import { BookMetadata } from './book-metadata.js'
import { Chapter } from './chapter.js'

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
    const filePath = await this._assetDownloader.mapFilePath(bookMetaData.coverUrl)
    await this._assetDownloader.download(bookMetaData.coverUrl, filePath)
    return filePath
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

        const cacheDir = await this.prepareCacheDir()

        eventEmitter.emit(chapterLoadingStarted, new ChapterLoadingStartedEvent(chapterUrls.length))
        const chapters = Parallel.map(
          chapterUrls,
          async (url, index) => {
            const chapter = new Chapter(url, index + startWith, cacheDir)
            await chapter.load(this._assetDownloader)
            return chapter
          },
          { concurrency: 20 }
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
    const responseText = await response.text()

    const page = await Browser.newPage()
    await page.setContent(responseText)
    const urlStrings = await page.$$eval(
      '.toc_w',
      (chapterNodes) =>
        chapterNodes
          .sort((nodeA, nodeB) => (
            Math.sign(parseInt(nodeA.getAttribute('order'), 10) - parseInt(nodeB.getAttribute('order'), 10)))
          )
          .map((chapterNode) => chapterNode.querySelector('.toc_a').getAttribute('href'))
    )
    await page.close()
    return urlStrings.map((urlString) => new URL(urlString))
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
