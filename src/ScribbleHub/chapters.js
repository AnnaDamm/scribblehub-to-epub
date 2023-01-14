import {browser} from "../Browser/browser.js";


const allChaptersUrl = "https://www.scribblehub.com/wp-admin/admin-ajax.php"

export class Chapters {
    /**
     * @param {URL} url
     */
    constructor(url) {
        this.url = url;
    }

    /**
     * @returns {number}
     */
    get postId() {
        return parseInt(this.url.toString().replace(/^.+\/series\/(\d+).*$/, '$1'), 10);
    }


    /**
     * @returns {Promise<URL[]>}
     */
    async loadChapterUrls() {
        return await browser.wrapPage(async (page) => {
            const response = await browser.sendPostRequest(page, allChaptersUrl, new URLSearchParams({
                action: 'wi_getreleases_pagination',
                pagenum: -1,
                mypostid: this.postId
            }).toString());


            return page.evaluate(async (responseText) => {
                const templateElement = document.createRange().createContextualFragment(responseText);

                const chapterDivs = [...templateElement.querySelectorAll('.toc_w')]
                    .sort((divA, divB) => Math.sign(
                        parseInt(divA.getAttribute('order'), 10) - parseInt(divB.getAttribute('order'), 10)
                    ));
                return chapterDivs.map((div) => {
                    const anchor = div.querySelector('.toc_a');
                    return anchor.getAttribute('href');
                });
            }, await response.text());
        });
    }
}
