import fs from 'fs'
import path from 'path'
import Enquirer from 'enquirer'

const defaultExtension = '.epub'

class OutFileSingleton {
  /**
   * @param {string} outFile
   * @param {function(): Promise<string>} fallbackNameFunction
   * @param {boolean|undefined} overwrite
   * @returns {Promise<string>}
   */
  async prepareOutFile (outFile, fallbackNameFunction, overwrite) {
    if (outFile === undefined) {
      outFile = (await fallbackNameFunction()) + defaultExtension
    }
    outFile = path.isAbsolute(outFile) ? outFile : path.resolve(process.cwd(), outFile)
    const directory = path.dirname(outFile)
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true })
    }
    if (
      overwrite === false ||
      (overwrite === undefined && fs.existsSync(outFile) && !(await this.askForFileOverwrite(outFile)))) {
      throw new Error('Not overwriting existing file. aborting.')
    }

    return outFile
  }

  /**
   * @param {string} outFile
   * @returns Promise<boolean>
   * @private
   */
  async askForFileOverwrite (outFile) {
    return await new Enquirer.Confirm({
      message: `File ${outFile} already exists. Overwrite?`,
      initial: true
    }).run()
  }
}

export const OutFile = new OutFileSingleton()
