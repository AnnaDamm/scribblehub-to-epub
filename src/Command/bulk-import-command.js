import { Command } from 'commander'

/**
 * @typedef {Object} ParsedOptions
 * @property {boolean|undefined} overwrite
 * @property {number} verbose
 * @property {boolean} quiet
 * @property {boolean} progress
 * @property {string} cacheDir
 * @property {number} startWith
 * @property {number|undefined} endWith
 */

export class BulkImportCommand extends Command {
  constructor () {
    super('bulk-import')
    this
      .description('imports new chapters for books from a urls file')
      .addHelpText('after', `
Chapters are automatically updated within the config file.
Books can be added to the config file by the --save flag of the normal import command.`)
      .requiredOption('--urls-file <urls-file>', 'urls file name', 'urls.json')
      .action(this.run)
  }

  /**
   * @param {BulkImportOptions} options
   * @returns {Promise<void>}
   */
  async run (options) {
    console.log(options)
  }
}
