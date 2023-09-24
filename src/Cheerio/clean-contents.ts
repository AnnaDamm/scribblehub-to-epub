import Cheerio = cheerio.Cheerio;

export function cleanContents(contents: Cheerio): Cheerio {
    removeAds(contents)
    removeComments(contents)

    return contents
}

function removeAds(contents: Cheerio): void {
    contents.find('[class^="ad_"], [id^="div-gpt-ad"]').remove()
}

function removeComments(contents: Cheerio): void {
    contents.find('*').contents().filter((i, node) => node.type === 'comment').remove()
}
