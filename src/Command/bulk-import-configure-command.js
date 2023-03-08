import { Command } from 'commander'
import enquirer from 'enquirer'
import { defaultSaveFile } from './constants.js'

/**
 * @typedef {Object} ParsedOptions
 */

export class BulkImportConfigureCommand extends Command {
  constructor () {
    super('configure')
    this
      .description('creates an urls file with configuration')
      .action(this.run)
  }

  /**
   * @param {ParsedOptions} options
   * @returns {Promise<void>}
   */
  async run (options) {
    const fileNameConfig = await enquirer.prompt({
      type: 'input',
      name: 'fileName',
      message: 'file name:',
      initial: defaultSaveFile
    })
    console.log(fileNameConfig)
    const config = await enquirer.prompt([
      {
        type: 'input',
        name: 'threshold',
        message: 'How many chapters must be new for them to be used?',
        initial: 1,
        validate: (value) => !isNaN(value),
        result: (value) => parseInt(value, 10)
      }
    ])

    console.log(config)
  }
}
