import { createHash } from 'crypto'
import fs from 'fs'
import streamWeb from 'node:stream/web';
import path from 'path'
import stream from 'stream'
import { assetAlreadyDownloaded, AssetAlreadyDownloadedEvent } from '../../Events/asset-already-download'
import { assetDownloadFinished, AssetDownloadFinishedEvent } from '../../Events/asset-download-finished'
import { assetDownloadStarted, AssetDownloadStartedEvent } from '../../Events/asset-download-started'
import { eventEmitter } from '../../Events/event-emitter'

export class AssetDownloader {
    constructor(
        private readonly cacheDir: Promise<string>
    ) {
    }

    public async fetchImagesFromQuery($: cheerio.Root, selector: string): Promise<void> {
        const urls = <URL[]><unknown>(await Promise.all(
            $(selector)
                .map(async (_, image) => {
                    const $image = $(image)
                    const urlString = $image.attr('src')
                    if (!urlString) {
                        return
                    }
                    const url = new URL(urlString)
                    $image.attr('src', `file://${await this.mapFilePath(url)}`)

                    return url
                })
        )).filter(Boolean)

        await Promise.all(
            urls.map(async (url: URL) => {
                let error
                let tries = 0
                do {
                    try {
                        await this.download(url)
                    } catch (e) {
                        error = e
                    }
                } while (error && tries++ < 3)
            })
        )
    }

    private async mapFilePath(url: URL): Promise<string> {
        return path.resolve(
            await this.cacheDir,
            `images/${this.createShaSum(url)}${path.extname(url.pathname)}`
        )
    }

    private createShaSum(url: URL): string {
        const hash = createHash('sha1')
        hash.update(url.toString())
        return hash.digest('hex')
    }

    public async download(url: URL): Promise<string> {
        const filePath = await this.mapFilePath(url)
        if (fs.existsSync(filePath)) {
            eventEmitter.emit(assetAlreadyDownloaded, new AssetAlreadyDownloadedEvent(filePath))
            return filePath
        }

        const dirName = path.dirname(filePath)
        if (!fs.existsSync(dirName)) {
            fs.mkdirSync(path.dirname(filePath), {recursive: true})
        }

        eventEmitter.emit(assetDownloadStarted, new AssetDownloadStartedEvent(url, filePath))
        await this.saveImageToDisk(url, filePath)
        eventEmitter.emit(assetDownloadFinished, new AssetDownloadFinishedEvent(url, filePath))

        return filePath
    }

    private async saveImageToDisk(url: URL, filePath: string): Promise<void> {
        const response = await fetch(url.toString())
        if (response.body === null) {
            throw Error('Could not download image' + url);
        }
        const fileStream = fs.createWriteStream(filePath)
        await stream.promises.finished(
            stream.Readable.fromWeb(<streamWeb.ReadableStream>response.body).pipe(fileStream)
        )
    }
}
