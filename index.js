import { ImportCommand } from './src/Command/import-command.js'

const importCommand = new ImportCommand()
await importCommand.parseAsync()
