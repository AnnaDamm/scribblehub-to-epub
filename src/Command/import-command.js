import { SingleBar } from 'cli-progress'
import { Command } from 'commander'
import findCacheDirectory from 'find-cache-dir'
import { createRequire } from 'module'
import os from 'os'
import path from 'path'
import { Browser } from '../Browser/browser.js'
import { chapterLoaded } from '../Events/chapter-loaded.js'
import { chapterLoadingFinished } from '../Events/chapter-loading-finished.js'
import { chapterLoadingStarted } from '../Events/chapter-loading-started.js'
import { allEvents, eventEmitter } from '../Events/event-emitter.js'
import { Exporter } from '../Exporter/exporter.js'
import { OutFile } from '../Exporter/out-file.js'
import { Book } from '../ScribbleHub/book.js'
import { Verbosity } from './constants.js'

const require = createRequire(import.meta.url)

const commandName = 'scribblehub-to-epub'

/**
 * @typedef {Object} ParsedOptions
 * @property {boolean|undefined} overwrite
 * @property {number} verbose
 * @property {boolean} quiet
 * @property {boolean} progress
 * @property {string} tmpDir
 * @property {string} cacheDir
 * @property {number} startWith
 * @property {number|undefined} endWith
 */

/**
 * @typedef {Object} Options
 * @property {boolean|undefined} overwrite
 * @property {number} verbosity
 * @property {boolean} progress
 * @property {string} tmpDir
 * @property {string} cacheDir
 * @property {number} startWith
 * @property {number|undefined} endWith
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
      .version(require('../../package.json').version)
      .description('Downloads a book from scribblehub.com and outputs it as an epub file')
      .argument('<url>', 'base url of the Scribble Hub series, e.g. "https://www.scribblehub.com/series/36420/the-fastest-man-alive/"')
      .argument('[out-file]', 'file name of the generated epub, defaults to "dist/<book-url-slug>.epub"')

      .option('-s, --start-with <chapter>', 'Chapter index to start with', (value) => parseInt(value, 10), 1)
      .option('-e, --end-with <chapter>', 'Chapter index to end with, defaults to the end of the book', (value) => !!value ? parseInt(value, 10) : undefined, undefined)

      .option('-o, --overwrite', 'overwrite the [out-file] if it already exists')
      .option('-O, --no-overwrite', 'do not overwrite the [out-file] if it already exists')
      .option('-P, --no-progress', 'do not show a progress bar')

      .option('-v, --verbose', 'verbosity that can be increased (-v, -vv, -vvv)', (dummyValue, previous) => previous + 1, 0)
      .option('-q, --quiet', 'do not output anything', false)

      .option('--tmp-dir <dir>', 'Temp directory', this.defaultTmpDir)
      .option('--cache-dir <dir>', 'Cache directory', this.defaultCacheDir)
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

    const exporter = new Exporter()
    const book = new Book(new URL(urlString), options.cacheDir)

    const outFilePath = await this.prepareOutFile(book)

    await book.loadChapters(options.startWith, options.endWith)
    await exporter.export(book, outFilePath, {
      verbose: this.options.verbosity >= Verbosity.verbose,
      tempDir: this.options.tmpDir
    })

    await Browser.close()
  }

  /**
   * @param {ParsedOptions} parsedOptions
   * @returns {Options}
   */
  mapOptions (parsedOptions) {
    const options = {
      ...parsedOptions,
      verbosity: parsedOptions.verbose,
    }
    // remove not used options
    options.verbose = undefined
    options.quiet = undefined

    if (parsedOptions.quiet) {
      options.verbosity = Verbosity.quiet
      options.progress = false
    }

    return options
  }

  /**
   * @returns {void}
   */
  addOutputEventHandlers () {
    if (this.options.verbosity >= Verbosity.veryVerbose) {
      eventEmitter.addListener(allEvents, (e) => this.write(e.toString()))
    }

    if (this.options.progress) {
      const chapterProgressBar = new SingleBar({
        format: '[{bar}] {percentage}% | {value}/{total} | ETA: {eta_formatted} | Time: {duration_formatted}' + (this.options.verbosity >= Verbosity.veryVerbose ? '\n\n' : '')
      })
      eventEmitter.addListener(chapterLoadingStarted,
        /** @param {ChapterLoadingStartedEvent} chapterLoadingStarted */
        (chapterLoadingStarted) => {
          this.write('Downloading chapters...')
          chapterProgressBar.start(chapterLoadingStarted.totalAmount)
        }
      )
      eventEmitter.addListener(chapterLoaded, () => chapterProgressBar.increment())
      eventEmitter.addListener(chapterLoadingFinished, () => {
        chapterProgressBar.stop()
        this.write('Done.')
      })
    } else if (this.options.verbosity >= Verbosity.verbose) {
      eventEmitter.addListener(chapterLoadingStarted, () => this.write('Downloading chapters...'))
      eventEmitter.addListener(chapterLoadingFinished, () => this.write('Done.'))
    }
  }

  /**
   * @param {Book} book
   * @returns {Promise<string>}
   */
  prepareOutFile (book) {
    return OutFile.prepareOutFile(this.outFile, async () => (await book.getBookMetaData()).slug, this.options.overwrite)
  }

  /**
   * @param {string} string
   * @param {number} verbosity
   * @param {boolean} addNewLine
   */
  write (string = '', verbosity = Verbosity.normal, addNewLine = true) {
    if (this.options.verbosity >= verbosity) {
      process.stdout.write(string + (addNewLine ? '\n' : ''))
    }
  }

  /**
   * @returns {string}
   */
  get defaultTmpDir () {
    return path.resolve(os.tmpdir(), commandName)
  }

  /**
   * @returns {string}
   */
  get defaultCacheDir () {
    return findCacheDirectory({ name: commandName })
  }
}
