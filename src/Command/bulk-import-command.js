import { Command } from 'commander'
import { BulkImportConfigureCommand } from './bulk-import-configure-command.js'
import { defaultSaveFile } from './constants.js'

/**
 * @typedef {Object} ParsedOptions
 * @property {string} urlsFile
 * @property {number} threshold
 * @property {boolean} squash
 */

export class BulkImportCommand extends Command {
  constructor () {
    super('bulk-import')
    this
      .description('Imports new chapters for books from a urls file and creates an epub file for each book with new chapters')
      .addHelpText('after', `
Chapters are automatically updated within the config file.
Books can be added to the config file by the --save option of the normal import command.`)
      .requiredOption('--urls-file <urls-file>', 'urls file name', defaultSaveFile)
      .option('--threshold <amount>', 'Minimum amount of new chapters for an epub to be created')
      .option('--squash', 'when set, will create a single epub file')
      .action(this.run)

    this.addCommand(new BulkImportConfigureCommand())
  }

  /**
   * @param {ParsedOptions} options
   * @returns {Promise<void>}
   */
  async run (options) {
    console.log(options)
  }
}
