import { Command } from 'commander'
import Enquirer from 'enquirer'
import { defaultSaveFile } from './constants.js'
import fs from 'fs'

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
    let currentConfig = {}
    const config = await Enquirer.prompt([
      {
        type: 'input',
        name: 'fileName',
        message: 'file name:',
        initial: defaultSaveFile,
        result: (value) => {
          try {
            currentConfig = fs.readFileSync(value)
          } catch {}
        }
      },
      {
        type: 'numeral',
        name: 'threshold',
        message: 'How many chapters must be new for them to be used? (> 0)',
        initial: () => currentConfig.threshold || 1,
        validate: (number) => {
          return Number.isInteger(number) && number > 0
        },
        result: (value) => parseInt(value, 10)
      },
      {
        type: 'confirm',
        name: 'squash',
        message: 'Squash new chapters into a single epub file?',
        initial: () => currentConfig.squash || false
      }
    ])

    console.log(config)
    fs.writeFileSync(config.fileName, JSON.stringify({
      version: 1,
      urls: currentConfig.urls || {},
      config
    }, null, 2))
  }
}
