import { SingleBar } from 'cli-progress'
import { Command } from 'commander'
import { Browser } from '../Browser/browser.js'
import { bookMetadataLoaded } from '../Events/book-metadata-loaded.js'
import { chapterLoaded } from '../Events/chapter-loaded.js'
import { chapterLoadingFinished } from '../Events/chapter-loading-finished.js'
import { chapterLoadingStarted } from '../Events/chapter-loading-started.js'
import { eventEmitter } from '../Events/event-emitter.js'
import { mainPageLoaded } from '../Events/main-page-loaded.js'
import { OutFile } from '../Exporter/out-file.js'
import { Book } from '../ScribbleHub/book.js'

const Verbosity = {
  quiet: -1,
  normal: 0,
  verbose: 1,
  veryVerbose: 2
}

/**
 * @typedef {Object} ParsedOptions
 * @property {boolean|undefined} overwrite
 * @property {number} verbose
 * @property {boolean} quiet
 * @property {boolean} progress
 */

/**
 * @typedef {Object} Options
 * @property {boolean|undefined} overwrite
 * @property {number} verbosity
 * @property {boolean} progress
 */
/**
 * @property {string} urlString
 * @property {string|undefined} outFile
 * @property {Options} options
 */
export class ImportCommand extends Command {
  constructor () {
    super('scribble-to-epub')
    this
      .description('Downloads a book from scribblehub.com and outputs it as an epub file')
      .argument('<url>', 'base url of the Scribble Hub series')
      .argument('[out-file]', 'file name of the generated epub, defaults to "dist/<book-url-slug>.epub"')
      .option('-v, --verbose', 'verbosity that can be increased (-v, -vv, -vvv)', (dummyValue, previous) => previous + 1, 0)
      .option('-q, --quiet', 'do not output anything', false)
      .option('-o, --overwrite', 'overwrite the [out-file] if it already exists')
      .option('-O, --no-overwrite', 'do not overwrite the [out-file] if it already exists')
      .option('-P, --no-progress', 'do not show a progress bar')
      .action(this.run)
  }

  /**
   * @param {string} urlString
   * @param {string|undefined} outFile
   * @param {ParsedOptions} options
   * @returns {Promise<void>}
   */
  async run (urlString, outFile, options) {
    this.urlString = urlString
    this.outFile = outFile
    this.options = this.mapOptions(options)

    this.addOutputEventHandlers()

    const book = new Book(new URL(urlString))

    await this.prepareFileHandle(book)
    await this.loadChapters(book)

    await Browser.close()
  }

  /**
   * @param {ParsedOptions} parsedOptions
   * @returns {Options}
   */
  mapOptions (parsedOptions) {
    const options = {
      verbosity: parsedOptions.verbose,
      progress: parsedOptions.progress,
      overwrite: parsedOptions.overwrite
    }
    if (parsedOptions.quiet) {
      options.verbosity = Verbosity.quiet
      options.progress = false
    }

    return options
  }

  /**
   * @param {Book} book
   * @returns {Promise<Chapter[]>}
   */
  async loadChapters (book) {
    this.write('Downloading chapters...')
    const chapters = await book.getChapters()
    this.write('Done.')

    return chapters
  }

  /**
   * @returns {void}
   */
  addOutputEventHandlers () {
    if (this.options.verbosity >= Verbosity.veryVerbose) {
      eventEmitter.addListener(mainPageLoaded, (e) => this.write(e.toString()))
      eventEmitter.addListener(bookMetadataLoaded, (e) => this.write(e.toString()))
      eventEmitter.addListener(chapterLoadingStarted, (e) => this.write(e.toString()))
      eventEmitter.addListener(chapterLoaded, (e) => this.write(e.toString()))
      eventEmitter.addListener(chapterLoadingFinished, (e) => this.write(e.toString()))
    }
    if (this.options.verbosity >= Verbosity.verbose) {
      eventEmitter.addListener(mainPageLoaded, () => this.write('main page loaded'))
      eventEmitter.addListener(bookMetadataLoaded, () => this.write('book meta data loaded'))
    }
    if (this.options.progress) {
      const chapterProgressBar = new SingleBar({
        etaAsynchronousUpdate: true,
        forceRedraw: false,
        format: '[{bar}] {percentage}% | {value}/{total} | ETA: {eta_formatted} | Time: {duration_formatted}' + (Verbosity.veryVerbose ? '\n' : '')
      })
      eventEmitter.once(chapterLoadingStarted,
        /** @param {ChapterLoadingStartedEvent} chapterLoadingStarted */
        (chapterLoadingStarted) => chapterProgressBar.start(chapterLoadingStarted.totalAmount)
      )
      eventEmitter.addListener(chapterLoaded, () => chapterProgressBar.increment())
      eventEmitter.addListener(chapterLoadingFinished, () => chapterProgressBar.stop())
    }
  }

  /**
   * @param {Book} book
   * @returns {Promise<void>}
   */
  async prepareFileHandle (book) {
    try {
      await OutFile.prepareFileHandle(this.outFile, async () => (await book.getBookMetaData()).slug, this.options.overwrite)
    } catch (error) {
      process.stderr.write(error.toString())
      process.exit(1)
    }
  }

  /**
   * @param {string} string
   * @param {number} verbosity
   * @param {boolean} addNewLine
   */
  write (string, verbosity = Verbosity.normal, addNewLine = true) {
    if (this.options.verbosity >= verbosity) {
      process.stdout.write(string + (addNewLine ? '\n' : ''))
    }
  }
}
