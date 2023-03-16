import { bookMetadataLoaded, BookMetadataLoadedEvent } from '../Events/book-metadata-loaded.js'
import { eventEmitter } from '../Events/event-emitter.js'
import * as cheerio from 'cheerio'
import { cleanContents } from '../Cheerio/clean-contents.js'

/**
 * @property {URL} canonicalUrl
 * @property {string} slug
 * @property {string} title
 * @property {URL} coverUrl
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
   * @param {URL} url
   * @returns {Promise<this>}
   */
  async load (url) {
    const page = await fetch(url.toString())
    const $ = cheerio.load(await page.text())

    this.canonicalUrl = new URL($('meta[property="og:url"]').attr('content'))
    this.slug = this.canonicalUrl.toString().match(/.+\/(?<slug>.+?)\/$/).groups.slug
    this.title = $('meta[property="og:title"]').attr('content')
    this.coverUrl = $('meta[property="og:image"]').attr('content')
    this.date = this._parseUpdatedDate($('span[title^="Last updated:"]').attr('title'))
    this.description = $('meta[property="og:description"]').attr('content')
    this.postId = parseInt($('#mypostid').val(), 10)
    this.authorId = parseInt($('#authorid').val(), 10)
    this.authorName = $('meta[name="twitter:creator"]').attr('content')
    this.publisher = $('meta[property="og:site_name"]').attr('content')
    this.details = cleanContents($, $('.fic_row.details')).html()

    eventEmitter.emit(bookMetadataLoaded, new BookMetadataLoadedEvent(this))
  }

  /**
   * @param {string} dateString
   * @return {Date|null}
   * @private
   */
  _parseUpdatedDate (dateString) {
    let date = new Date(dateString.replace(/^Last updated: /, ''))
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
