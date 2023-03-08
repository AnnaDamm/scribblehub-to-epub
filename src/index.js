#!/usr/bin/env node
import { BaseCommand } from './Command/base-command.js'

const command = new BaseCommand()

await command.parseAsync()
