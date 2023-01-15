import * as Parallel from 'async-parallel'
import { Browser } from '../Browser/browser.js'
import { chapterLoadingFinished, ChapterLoadingFinishedEvent } from '../Events/chapter-loading-finished.js'
import { chapterLoadingStarted, ChapterLoadingStartedEvent } from '../Events/chapter-loading-started.js'
import { eventEmitter } from '../Events/event-emitter.js'
import { MainPageLoaded, mainPageLoaded } from '../Events/main-page-loaded.js'
import { BookMetadata } from './book-metadata.js'
import { Chapter } from './chapter.js'

const allChaptersPath = '/wp-admin/admin-ajax.php'

/**
 * @property {URL} url
 */
export class Book {
  /**
   * @param {URL} url
   */
  constructor (url) {
    this.url = url
  }

  /**
   * @returns {Promise<BookMetadata>}
   */
  async getBookMetaData () {
    if (this._bookMetaData === undefined) {
      this._bookMetaData = new BookMetadata()
      await this._bookMetaData.load(await this.getPage())
      eventEmitter.emit(mainPageLoaded, new MainPageLoaded(this))
    }
    return this._bookMetaData
  }

  /**
   * @private
   */
  async getPage () {
    if (this._page === undefined) {
      this._page = await Browser.newPage()
      await this._page.goto(this.url.toString())
      await this._page.waitForSelector('body')
    }

    return this._page
  }

  /**
   * @param {AssetDownloader} assetDownloader
   * @returns {Promise<void>}
   */
  async loadImage (assetDownloader) {
    const bookMetaData = await this.getBookMetaData()
    await assetDownloader.download(bookMetaData.titleImageUrl)
  }

  /**
   * @param {AssetDownloader} assetDownloader
   * @returns {Promise<Chapter[]>}
   */
  async loadChapters (assetDownloader) {
    if (this._chapters === undefined) {
      const chapterUrls = (await this.getChapterUrls())
      eventEmitter.emit(chapterLoadingStarted, new ChapterLoadingStartedEvent(chapterUrls.length))

      this._chapters = Parallel.map(
        chapterUrls,
        async (url) => await new Chapter().load(assetDownloader, url),
        { concurrency: 5 }
      ).then((chapters) => {
        eventEmitter.emit(chapterLoadingFinished, new ChapterLoadingFinishedEvent(chapters))
      })
    }

    return this._chapters
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
    return urlStrings.map((urlString) => new URL(urlString))
  }
}
