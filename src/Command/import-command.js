import { Command } from 'commander'
import { Book } from '../ScribbleHub/book.js'
import { Browser } from '../Browser/browser.js'
import { OutFile } from '../exporter/out-file.js'

export class ImportCommand extends Command {
  constructor () {
    super()
    this
      .name('scribble-to-epub')
      .argument('<url>', 'base url of the Scribble Hub series')
      .argument('[out-file.js]', 'file name of the generated epub')
      .action(this.run)
  }

  /**
   * @param {string} urlString
   * @param {string|undefined} outFile
   * @returns {Promise<void>}
   */
  async run (urlString, outFile) {
      const book = new Book(new URL(urlString))

      try {
        await OutFile.prepareFileHandle(outFile, async () => (await book.getBookMetaData()).slug)
      } catch (error) {
        process.stderr.write(error.toString())
        process.exit(1)
      }

      await Browser.close()
  }
}