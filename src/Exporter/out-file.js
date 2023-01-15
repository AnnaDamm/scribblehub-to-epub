import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import yesno from 'yesno'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultDistDirectory = path.resolve(__dirname, '../..', 'dist')
const defaultExtension = '.epub'

class OutFileSingleton {
  /**
   * @param {string} outFile
   * @param {function(): Promise<string>} fallbackNameFunction
   * @param {boolean|undefined} overwrite
   * @returns {Promise<number>}
   */
  async prepareFileHandle (outFile, fallbackNameFunction, overwrite) {
    if (outFile === undefined) {
      outFile = path.resolve(defaultDistDirectory, (await fallbackNameFunction()) + defaultExtension)
      if (!fs.existsSync(defaultDistDirectory)) {
        fs.mkdirSync(defaultDistDirectory)
      }
    } else {
      outFile = path.isAbsolute(outFile) ? outFile : path.resolve(process.cwd(), outFile)
    }
    if (
      overwrite === false ||
      (overwrite === undefined && fs.existsSync(outFile) && !(await this.askForFileOverwrite(outFile)))) {
      throw new Error('Not overwriting existing file. aborting.')
    }

    try {
      return fs.openSync(outFile, 'w')
    } catch {
      throw new Error('Not overwriting existing file. aborting.')
    }
  }

  /**
   * @param {string} outFile
   * @returns Promise<boolean>
   * @private
   */
  async askForFileOverwrite (outFile) {
    return await yesno({
      question: `File ${outFile} already exists. Overwrite? [Y]/N`,
      defaultValue: true
    })
  }
}

export const OutFile = new OutFileSingleton()
