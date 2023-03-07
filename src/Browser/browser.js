import puppeteer from 'puppeteer'

class BrowserSingleton {
  /**
   * @returns {Promise<Browser>}
   */
  async launch () {
    if (this.browser === undefined) {
      this.browser = await puppeteer.launch({ headless: true })
    }
    return this.browser
  }

  /**
   * @returns {Promise<void>}
   */
  async close () {
    if (this.browser !== undefined) {
      await this.browser.close()
    }
  }

  async getPage () {
    const browser = await this.launch()
    return await this._preparePage((await browser.pages())[0])
  }

  /**
   * @returns {Promise<Page>}
   */
  async newPage () {
    const browser = await this.launch()
    const page = await browser.newPage()

    return this._preparePage(page)
  }

  /**
   * @param {Page} page
   * @returns {Promise<Page>}
   * @private
   */
  async _preparePage (page) {
    await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0')
    this._addConsoleLog(page)

    return page
  }

  /**
   * @param {Page} page
   * @private
   */
  _addConsoleLog (page) {
    page.on('console', async (msg) => {
      const msgArgs = msg.args()
      for (let i = 0; i < msgArgs.length; ++i) {
        console.log(await msgArgs[i].jsonValue())
      }
    })
  }
}

export const Browser = new BrowserSingleton()
