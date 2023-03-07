#!/usr/bin/env node
import { ImportCommand } from './Command/import-command.js'
import { Command } from 'commander'
import { BulkImportCommand } from './Command/bulk-import-command.js'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const packageJson = require('../package.json')

const command = new Command()
  .version(packageJson.version)
  .name('scribblehub-to-epub')
  .addCommand(new ImportCommand(), {
    isDefault: true
  })
  .addCommand(new BulkImportCommand())
await command.parseAsync()
