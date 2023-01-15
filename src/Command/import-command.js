import { Command } from 'commander'
import { Book } from '../ScribbleHub/book.js'
import { Browser } from '../Browser/browser.js'
import { OutFile } from '../Exporter/out-file.js'
import { SingleBar } from 'cli-progress'
import { eventEmitter } from '../Events/event-emitter.js'
import { chapterLoaded } from '../Events/chapter-loaded-event.js'
import { chapterLoadingStarted } from '../Events/chapter-loading-started-event.js'

export class ImportCommand extends Command {
  constructor () {
    super()
    this
      .name('scribble-to-epub')
      .description('Downloads a book from scribblehub.com and outputs it as an epub file')
      .argument('<url>', 'base url of the Scribble Hub series')
      .argument('[out-file]', 'file name of the generated epub, defaults to "dist/<book-url-slug>.epub"')
      .option('--overwrite', 'overwrite the [out-file] if it already exists')
      .option('--no-overwrite', 'do not overwrite the [out-file] if it already exists')
      .action(this.run)
  }

  /**
   * @typedef {Object} Options
   * @property {boolean|undefined} overwrite
   */
  /**
   * @param {string} urlString
   * @param {string|undefined} outFile
   * @param {Options} options
   * @returns {Promise<void>}
   */
  async run (urlString, outFile, options) {
    const book = new Book(new URL(urlString))

    await this.prepareFileHandle(outFile, book, options.overwrite)
    await this.loadChapters(book)

    await Browser.close()
  }

  /**
   * @param {Book} book
   * @returns {Promise<Chapter[]>}
   */
  async loadChapters (book) {
    const chapterProgressBar = new SingleBar({
      etaAsynchronousUpdate: true,
      forceRedraw: false,
      format: '[{bar}] {percentage}% | {value}/{total} | ETA: {eta_formatted} | Time: {duration_formatted}'
    })
    eventEmitter.addListener(
      chapterLoadingStarted,
      /*** @param {ChapterLoadingStartedEvent} chapterLoadingStarted */
      (chapterLoadingStarted) => {
        process.stdout.write('Downloading chapters...\n')
        chapterProgressBar.start(chapterLoadingStarted.totalAmount)
      }
    )
    eventEmitter.addListener(chapterLoaded, () => chapterProgressBar.increment())
    const chapters = await book.getChapters()
    chapterProgressBar.stop()
    process.stdout.write('Done in ' + chapterProgressBar.d)

    return chapters
  }

  /**
   * @param {string} outFile
   * @param {Book} book
   * @param {boolean|null} overwrite
   * @returns {Promise<void>}
   */
  async prepareFileHandle (outFile, book, overwrite) {
    try {
      await OutFile.prepareFileHandle(outFile, async () => (await book.getBookMetaData()).slug, overwrite)
    } catch (error) {
      process.stderr.write(error.toString())
      process.exit(1)
    }
  }
}