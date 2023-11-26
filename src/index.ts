#!/usr/bin/env node
import { ImportCommand } from './Command/import-command.js';

(async () => {
    const importCommand = new ImportCommand();
    await importCommand.init();
    await importCommand.parseAsync()
})();
