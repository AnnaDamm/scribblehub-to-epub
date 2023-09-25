import { SingleBar } from 'cli-progress'
import { Command } from 'commander'
import findCacheDirectory from 'find-cache-dir';
import * as path from 'path'
import { fileURLToPath } from 'url'

import packageJson from '../../package.json' assert { type: 'json' };
import { chapterLoaded } from '../Events/chapter-loaded.js';
import { chapterLoadingFinished } from '../Events/chapter-loading-finished.js';
import { chapterLoadingStarted } from '../Events/chapter-loading-started.js';
import { allEvents, eventEmitter } from '../Events/event-emitter.js';
import { Exporter } from '../Exporter/exporter.js';
import { OutFile } from '../Exporter/out-file.js';
import { Book } from '../sites/ScribbleHub/book.js';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const commandName = 'scribblehub-to-epub'

enum Verbosity {
    quiet = -1,
    normal = 0,
    verbose = 1,
    veryVerbose = 2
}

interface ParsedOptions {
    overwrite?: boolean;
    verbose: Verbosity;
    quiet: boolean;
    progress: boolean;
    cacheDir: string;
    startWith: number;
    endWith?: number;
}

interface InputOptions {
    overwrite?: boolean;
    verbosity: Verbosity;
    progress: boolean;
    cacheDir: string;
    startWith: number;
    endWith?: number;
}

export class ImportCommand extends Command {
    private outFile?: string;
    private inputOptions?: InputOptions;

    constructor() {
        super('scribble-to-epub')
        // noinspection HtmlDeprecatedTag,XmlDeprecatedElement
        this
            .version(packageJson.version)
            .description('Downloads a book from scribblehub.com and outputs it as an epub file')
            .argument('<url>', 'base url of the Scribble Hub series (e.g. "https://www.scribblehub.com/series/36420/the-fastest-man-alive/).' +
                'Using a url of a chapter instead of the main page will start downloading on that chapter, overriding the "start-with" option')
            .argument('[out-file]', 'file name of the generated epub, defaults to "dist/<book-url-slug>.epub"')

            .option('-s, --start-with <chapter>', 'Chapter index to start with. Will be ignored when the <url> parameter is a chapter url', (value) => parseInt(value, 10), 1)
            .option('-e, --end-with <chapter>', 'Chapter index to end with, defaults to the end of the book', (value) => value ? parseInt(value, 10) : undefined, undefined)

            .option('-o, --overwrite', 'overwrite the [out-file] if it already exists')
            .option('-O, --no-overwrite', 'do not overwrite the [out-file] if it already exists')
            .option('-P, --no-progress', 'do not show a progress bar')

            .option('-v, --verbose', 'verbosity that can be increased (-v, -vv, -vvv)', (dummyValue, previous) => previous + 1, 0)
            .option('-q, --quiet', 'do not output anything', false)

            .option('--cache-dir <dir>', 'Cache directory', this.defaultCacheDir)
            .action(this.run)
    }

    private async run(urlString: string, outFile: string | undefined, options: ParsedOptions): Promise<void> {
        this.outFile = outFile
        this.inputOptions = this.mapOptions(options)

        this.addOutputEventHandlers()

        const exporter = new Exporter()
        const book = new Book(new URL(urlString), options.cacheDir)
        await book.init()

        const outFilePath = await this.prepareOutFile(book)

        await book.loadChapters(options.startWith, options.endWith)
        await exporter.export(book, outFilePath, {
            verbose: this.inputOptions.verbosity >= Verbosity.verbose
        })
    }

    private mapOptions(parsedOptions: ParsedOptions): InputOptions {
        const options: InputOptions = {
            overwrite: parsedOptions.overwrite,
            verbosity: Math.min(Verbosity.veryVerbose, Math.max(Verbosity.quiet, parsedOptions.verbose)),
            progress: parsedOptions.progress,
            cacheDir: parsedOptions.cacheDir,
            startWith: parsedOptions.startWith,
            endWith: parsedOptions.endWith,
        }

        if (parsedOptions.quiet) {
            options.verbosity = Verbosity.quiet
            options.progress = false
        }

        return options;
    }

    private addOutputEventHandlers(): void {
        if (this.inputOptions!.verbosity >= Verbosity.veryVerbose) {
            eventEmitter.addListener(allEvents, (e) => this.write(e.toString()))
        }

        if (this.inputOptions!.progress) {
            const chapterProgressBar = new SingleBar({
                format: '[{bar}] {percentage}% | {value}/{total} | Time: {duration_formatted}' + (this.inputOptions!.verbosity >= Verbosity.veryVerbose ? '\n\n' : '')
            })
            eventEmitter.addListener(chapterLoadingStarted,
                /** @param {ChapterLoadingStartedEvent} chapterLoadingStarted */
                (chapterLoadingStarted) => {
                    this.write('Downloading chapters...')
                    chapterProgressBar.start(chapterLoadingStarted.totalAmount, 0)
                }
            )
            eventEmitter.addListener(chapterLoaded, () => chapterProgressBar.increment())
            eventEmitter.addListener(chapterLoadingFinished, () => {
                chapterProgressBar.stop()
                this.write('Done.')
            })
        } else if (this.inputOptions!.verbosity >= Verbosity.verbose) {
            eventEmitter.addListener(chapterLoadingStarted, () => this.write('Downloading chapters...'))
            eventEmitter.addListener(chapterLoadingFinished, () => this.write('Done.'))
        }
    }

    private prepareOutFile(book: Book): Promise<string> {
        return OutFile.prepareOutFile(
            this.outFile!,
            async () => (await book.getBookMetaData()).slug,
            this.inputOptions!.overwrite
        )
    }

    private write(
        string: string = '',
        verbosity: Verbosity = Verbosity.normal,
        addNewLine: boolean = true
    ): void {
        if (this.inputOptions!.verbosity >= verbosity) {
            process.stdout.write(string + (addNewLine ? '\n' : ''));
        }
    }

    private get defaultCacheDir(): string {
        const cacheDir = findCacheDirectory({
            name: commandName,
            cwd: __dirname
        });

        if (!cacheDir) {
            throw Error('Could not find cache directory');
        }

        return path.resolve(cacheDir, '3')
    }
}
