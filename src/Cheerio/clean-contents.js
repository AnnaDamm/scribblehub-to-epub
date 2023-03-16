/**
 * @param {cheerio} $
 * @param {cheerio} contents
 * @returns {cheerio}
 */
export function cleanContents ($, contents) {
  removeAds(contents)
  removeComments(contents)
  removeEmptyElements($, contents)

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

/**
 * @param {cheerio} $
 * @param {cheerio} contents
 */
function removeEmptyElements ($, contents) {
  // remove empty elements anywhere
  let emptyElements
  let amount
  do {
    emptyElements = contents.find('*').contents().filter(
      (i, node) => $(node).text().match(/\S/) === null
    )
    amount = emptyElements.length
    emptyElements.remove()
  } while (amount > 0)

  // remove empty top level elements
  contents.contents().filter(
    (i, node) => $(node).text().match(/\S/) === null
  ).remove()
}
