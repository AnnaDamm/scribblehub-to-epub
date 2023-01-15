import { bookMetadataLoaded, BookMetadataLoadedEvent } from '../Events/book-metadata-loaded.js'
import { eventEmitter } from '../Events/event-emitter.js'

/**
 * @property {URL} canonicalUrl
 * @property {string} slug
 * @property {string} title
 * @property {URL} titleImageUrl
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
  async load (page) {
    await Promise.all([
      async () => {
        this.canonicalUrl = new URL(await page.$eval('meta[property="og:url"]', (element) => element.getAttribute('content')))
        this.slug = this.canonicalUrl.toString().match(/.+\/(?<slug>.+?)\/$/).groups.slug
      },
      async () => { this.title = await page.$eval('meta[property="og:title"]', (element) => element.getAttribute('content')) },
      async () => { this.titleImageUrl = new URL(await page.$eval('meta[property="og:image"]', (element) => element.getAttribute('content'))) },
      async () => { this.description = await page.$eval('meta[property="og:description"]', (element) => element.getAttribute('content')) },
      async () => { this.postId = parseInt(await page.$eval('#mypostid', (element) => element.getAttribute('value')), 10) },
      async () => { this.authorId = parseInt(await page.$eval('#authorid', (element) => element.getAttribute('value')), 10) },
      async () => { this.authorName = await page.$eval('meta[name="twitter:creator"]', (element) => element.getAttribute('content')) }
    ].map((func) => func()))
    eventEmitter.emit(bookMetadataLoaded, new BookMetadataLoadedEvent(this))
  }
}
