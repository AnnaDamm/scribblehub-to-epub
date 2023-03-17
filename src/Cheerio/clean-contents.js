/**
 * @param {cheerio} $
 * @param {cheerio} contents
 * @returns {cheerio}
 */
export function cleanContents ($, contents) {
  removeAds(contents)
  removeComments(contents)

  return contents
}

/**
 * @param {cheerio} contents
 */
function removeAds (contents) {
  contents.find('[class^="ad_"], [id^="div-gpt-ad"]').remove()
}

/**
 * @param {cheerio} contents
 */
function removeComments (contents) {
  contents.find('*').contents().filter((i, node) => node.type === 'comment').remove()
}
