import fs from 'fs'
import zlib from 'zlib'

class FileCache {
  /**
   * @param {string} filePath
   * @param {string} data
   */
  writeString (filePath, data) {
    fs.writeFileSync(filePath, zlib.brotliCompressSync(data))
  }

  /**
   * @param {string} filePath
   * @returns {string}
   */
  readString (filePath) {
    return zlib.brotliDecompressSync(fs.readFileSync(filePath)).toString()
  }
}

export const fileCache = new FileCache()
