import { Browser } from '../Browser/browser.js'
import { BookMetadata } from './book-metadata.js'

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
    }

    return this._page
  }

  /**
   * @private
   * @returns { Promise<URL[]>}
   */
  get chapterUrls () {
    return (async () => {
      const page = await Browser.newPage()
      const response = await Browser.sendPostRequest(page, this.url.origin + allChaptersPath, new URLSearchParams({
        action: 'wi_getreleases_pagination',
        pagenum: -1,
        mypostid: (await this.getBookMetaData()).postId
      }).toString())

      await page.setContent(await response.text())
      return page.$$eval('.toc_w', (chapterNodes) =>
        chapterNodes
          .sort((nodeA, nodeB) => (
            Math.sign(parseInt(nodeA.getAttribute('order'), 10) - parseInt(nodeB.getAttribute('order'), 10)))
          )
          .map((chapterNode) => new URL(chapterNode.querySelector('.toc_a').getAttribute('href')))
      )
    })()
  }
}