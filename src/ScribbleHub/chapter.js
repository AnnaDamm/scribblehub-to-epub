import * as Parallel from 'async-parallel'
import { Browser } from '../Browser/browser.js'
import { chapterLoaded, ChapterLoadedEvent } from '../Events/chapter-loaded.js'
import { eventEmitter } from '../Events/event-emitter.js'

/**
 * @property {string} title
 * @property {string} text
 */
export class Chapter {
  /**
   * @param {AssetDownloader} assetDownloader
   * @param {URL} url
   * @returns {Promise<void>}
   */
  async load (assetDownloader, url) {
    const page = await Browser.newPage()
    await page.goto(url.toString())
    await page.waitForSelector('body')
    await assetDownloader.fetchImagesFromQuery(page, '#chp_contents img[src]')
    await Parallel.invoke([
      async () => {
        this.id = await page.$eval('link[rel="shortlink"]',
          (node) => parseInt(node.getAttribute('href').match(/\?p=(?<id>\d+)$/).groups.id, 10)
        )
      },
      async () => { this.title = await page.$eval('.chapter-title', (node) => node.innerHTML) },
      async () => { this.text = await page.$eval('#chp_raw', (node) => node.innerHTML) },
    ])
    eventEmitter.emit(chapterLoaded, new ChapterLoadedEvent(this))
  }
}
