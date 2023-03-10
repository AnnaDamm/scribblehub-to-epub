import * as Parallel from 'async-parallel'
import { bookMetadataLoaded, BookMetadataLoadedEvent } from '../Events/book-metadata-loaded.js'
import { eventEmitter } from '../Events/event-emitter.js'

/**
 * @property {URL} canonicalUrl
 * @property {string} slug
 * @property {string} title
 * @property {URL} cover
 * @property {string} description
 * @property {string} details
 * @property {Date} date
 * @property {number} postId
 * @property {number} authorId
 * @property {string} authorName
 * @property {string} publisher
 */
export class BookMetadata {
  /**
   * @param {Page} page
   * @returns {Promise<this>}
   */
  async load (page) {
    await Parallel.invoke([
      async () => {
        this.canonicalUrl = new URL(await page.$eval('meta[property="og:url"]', (element) => element.getAttribute('content')))
        this.slug = this.canonicalUrl.toString().match(/.+\/(?<slug>.+?)\/$/).groups.slug
      },
      async () => { this.title = await page.$eval('meta[property="og:title"]', (element) => element.getAttribute('content')) },
      async () => { this.cover = new URL(await page.$eval('meta[property="og:image"]', (element) => element.getAttribute('content'))) },
      async () => { this.date = this.parseUpdatedDate(await page.$eval('span[title^="Last updated:"]', (element) => element.getAttribute('title').replace(/^Last updated: /, ''))) },
      async () => { this.description = await page.$eval('meta[property="og:description"]', (element) => element.getAttribute('content')) },
      async () => {
        await page.$$eval('[class^="ad_"]', (nodes) => nodes.forEach((node) => node.remove()))
        this.details = await page.$eval('.box_fictionpage.details', (element) => element.innerHTML)
      },
      async () => { this.postId = parseInt(await page.$eval('#mypostid', (element) => element.getAttribute('value')), 10) },
      async () => { this.authorId = parseInt(await page.$eval('#authorid', (element) => element.getAttribute('value')), 10) },
      async () => { this.authorName = await page.$eval('meta[name="twitter:creator"]', (element) => element.getAttribute('content')) },
      async () => { this.publisher = await page.$eval('meta[property="og:site_name"]', (element) => element.getAttribute('content')) }
    ])
    eventEmitter.emit(bookMetadataLoaded, new BookMetadataLoadedEvent(this))
  }

  /**
   * @param {string} dateString
   * @return {Date|null}
   */
  parseUpdatedDate (dateString) {
    let date = new Date(dateString)
    if (date.toString() !== 'Invalid Date') {
      return date
    }
    date = new Date()
    let matches = dateString.match(/(?<hours>\d+) hours ago/)
    if (matches !== null) {
      date.setHours(date.getHours() - parseInt(matches.groups.hours, 10))
      return date
    }
    matches = dateString.match(/(?<minutes>\d+) minutes ago/)
    if (matches !== null) {
      date.setMinutes(date.setMinutes() - parseInt(matches.groups.minutes, 10))
      return date
    }

    return date
  }
}
