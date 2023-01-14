import puppeteer from "puppeteer";

export class Browser {
    /**
     * @returns {Promise<Browser>}
     */
    async launch() {
        if (this.browser === undefined) {
            this.browser = await puppeteer.launch();
        }
        return this.browser;
    }

    /**
     * @returns {Promise<void>}
     */
    async close() {
        if (this.browser !== undefined) {
            await this.browser.close();
        }
    }


    /**
     * @callback wrapPageCallback
     * @param {Page} page
     * @return Promise<void>
     */
    /**
     * @param {wrapPageCallback} callback
     */
    async wrapPage(callback) {
        const browser = await this.launch();
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 5.1; rv:5.0) Gecko/20100101 Firefox/5.0');
        this.addConsoleLog(page);

        try {
            return await callback(page);
        } finally {
            await page.close();
        }
    }


    /**
     * @param {Page} page
     * @param {string} url
     * @param {string} postData
     * @param {Object.<string, string>} headers
     * @returns {Promise<Response>}
     */
    async sendPostRequest(page, url, postData, headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }) {
        await page.setRequestInterception(true);

        page.on('request', (interceptedRequest) => {
            interceptedRequest.continue({
                method: "POST",
                postData: postData,
                headers: {
                    ...interceptedRequest.headers(),
                    ...headers,
                }
            });
        });
        return await page.goto(url);
    }

    /**
     * @param {Page} page
     */
    addConsoleLog(page) {
        page.on('console', async (msg) => {
            const msgArgs = msg.args();
            for (let i = 0; i < msgArgs.length; ++i) {
                console.log(await msgArgs[i].jsonValue());
            }
        });
    }
}

export const browser = new Browser();
