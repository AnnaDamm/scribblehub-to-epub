import fs from 'fs'
import path from 'path'
import yesno from 'yesno'

const defaultExtension = '.epub'

class OutFile {
    public async prepareOutFile(
        outFile: string | undefined,
        fallbackNameFunction: () => Promise<string>,
        overwrite: boolean | undefined
    ): Promise<string> {
        if (outFile === undefined) {
            outFile = (await fallbackNameFunction()) + defaultExtension
        }
        outFile = path.isAbsolute(outFile) ? outFile : path.resolve(process.cwd(), outFile)
        const directory = path.dirname(outFile)
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, {recursive: true})
        }
        if (
            overwrite === false ||
            (overwrite === undefined && fs.existsSync(outFile) && !(await this.askForFileOverwrite(outFile)))) {
            throw new Error('Not overwriting existing file. aborting.')
        }

        return outFile
    }

    private async askForFileOverwrite(outFile: string): Promise<boolean> {
        return await yesno({
            question: `File ${outFile} already exists. Overwrite? [Y]/N`,
            defaultValue: true
        })
    }
}

export const outFile = new OutFile()
