import fs from 'fs'
import zlib from 'zlib'

class FileCache {
    public writeString(filePath: string, data: string): Promise<void> {
        return fs.promises.writeFile(filePath, zlib.brotliCompressSync(data))
    }

    public async readString(filePath: string): Promise<string> {
        return zlib.brotliDecompressSync(await fs.promises.readFile(filePath)).toString()
    }
}

export const fileCache = new FileCache()
