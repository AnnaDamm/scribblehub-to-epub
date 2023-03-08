import { Command } from 'commander'
import { commandName } from './constants.js'
import { createRequire } from 'module'
import { ImportCommand } from './import-command.js'
import { BulkImportCommand } from './bulk-import-command.js'

const require = createRequire(import.meta.url)
const packageJson = require('../../package.json')

export class BaseCommand extends Command {
  constructor () {
    super(commandName)

    this
      .version(packageJson.version)
      .addCommand(new ImportCommand(), {
        isDefault: true
      })
      .addCommand(new BulkImportCommand())
  }
}
