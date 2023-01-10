import {MainPage} from "./main-page.js";
import {Browser} from "../Browser/browser.js";


const allChaptersUrl = "https://www.scribblehub.com/wp-admin/admin-ajax.php"

export class Chapters {
    /**
     * @param {MainPage} mainPage
     */
    constructor(mainPage) {
        this.mainPage = mainPage;
    }

    /**
     * @returns {number}
     */
    get postId() {
        return parseInt(this.mainPage.url.replace(/^.+\/series\/(\d+).*$/, '$1'), 10);
    }

    async loadAllChapters() {
        await Browser.wrapPage(async (page) => {
            const response = await Browser.sendPostRequest(page, allChaptersUrl, new URLSearchParams({
                action: 'wi_getreleases_pagination',
                pagenum: -1,
                mypostid: this.postId
            }).toString());
            console.log(response.status(), await response.text());
        });
    }
}
