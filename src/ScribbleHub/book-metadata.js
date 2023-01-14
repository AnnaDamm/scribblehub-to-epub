/**
 * @property {string} canonicalUrl
 * @property {string} slug
 * @property {string} title
 * @property {string} titleImageUrl
 * @property {string} description
 * @property {number} postId
 * @property {number} authorId
 * @property {string} authorName
 */
export class BookMetadata {
  /**
   * @param {Page} page
   * @returns {Promise<this>}
   */
  load (page) {
    return Promise.all([
      async () => {
        this.canonicalUrl = await page.$eval('meta[property="og:url"]', (element) => element.getAttribute('content'))
        this.slug = this.canonicalUrl.match(/.+\/(?<slug>.+?)\/$/).groups.slug
      },
      async () => this.title = await page.$eval('meta[property="og:title"]', (element) => element.getAttribute('content')),
      async () => this.titleImageUrl = await page.$eval('meta[property="og:image"]', (element) => element.getAttribute('content')),
      async () => this.description = await page.$eval('meta[property="og:description"]', (element) => element.getAttribute('content')),
      async () => this.postId = parseInt(await page.$('#mypostid', (element) => element.getAttribute('value')), 10),
      async () => this.postId = parseInt(await page.$('#authorid', (element) => element.getAttribute('value')), 10),
      async () => this.description = await page.$eval('meta[name="twitter:creator"]', (element) => element.getAttribute('content')),
    ].map((func) => func()))
  }
}