import fs from 'fs'
import zlib from 'zlib'

class FileCache {
    public writeString(filePath: string, data: string): void {
        fs.writeFileSync(filePath, zlib.brotliCompressSync(data))
    }

    public readString(filePath: string): string {
        return zlib.brotliDecompressSync(fs.readFileSync(filePath)).toString()
    }
}

export const fileCache = new FileCache()
