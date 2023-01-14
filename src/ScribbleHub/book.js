import { Browser } from '../Browser/browser.js'

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
   * @returns {Promise<string>}
   */
  async getSlug () {
    const canonicalUrl = await this.getCanonicalUrl()
    const match = canonicalUrl.match(/.+\/(?<slug>.+?)\/$/)
    return match.groups.slug
  }

  /**
   * @returns {Promise<string>}
   */
  async getCanonicalUrl () {
    return (async () => {
      const page = await this.getPage()
      return await page.$eval('link[rel="canonical"]', (element) => element.getAttribute('href'))
    })()
  }

  /**
   * @returns {Promise<number>}
   */
  async getPostId () {
    const page = await this.getPage()
    return parseInt(await page.$('#id="mypostid"', (element) => element.getAttribute('value')), 10)
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
        mypostid: await this.getPostId()
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