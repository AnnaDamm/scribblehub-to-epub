import fs from 'fs'
import path from 'path'
import yesno from 'yesno'

const defaultExtension = '.epub'

class OutFileSingleton {
  /**
   * @param {string} outFile
   * @param {function(): Promise<string>} fallbackNameFunction
   * @param {boolean|undefined} overwrite
   * @returns {Promise<number>}
   */
  async prepareDirectory (outFile, fallbackNameFunction, overwrite) {
    if (outFile === undefined) {
      outFile = (await fallbackNameFunction()) + defaultExtension
    }
    outFile = path.isAbsolute(outFile) ? outFile : path.resolve(process.cwd(), outFile)
    if (
      overwrite === false ||
      (overwrite === undefined && fs.existsSync(outFile) && !(await this.askForFileOverwrite(outFile)))) {
      throw new Error('Not overwriting existing file. aborting.')
    }

    try {
      return fs.openSync(outFile, 'w')
    } catch {
      throw new Error(`Cannot write into ${outFile}`)
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
