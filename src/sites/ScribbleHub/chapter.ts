import * as cheerio from 'cheerio'
import path from 'path'
import { Memoize } from 'typescript-memoize';
import { fileCache } from '../../Cache/file-cache.js'
import { cleanContents } from '../../Cheerio/clean-contents.js'
import { chapterLoadedFromCache, ChapterLoadedFromCacheEvent } from '../../Events/chapter-loaded-from-cache.js'
import { chapterLoaded, ChapterLoadedEvent } from '../../Events/chapter-loaded.js'
import { chapterWrittenToCache, ChapterWrittenToCacheEvent } from '../../Events/chapter-written-to-cache.js'
import { eventEmitter } from '../../Events/event-emitter.js'
import { AssetDownloader } from '../Base/asset-downloader.js';
import { Chapter as ChapterModel } from '../Base/book.models.js'

export class Chapter implements ChapterModel {
    public text?: string;
    public title?: string;

    constructor(
        public url: URL,
        public index: number,
        private readonly cacheDir: string,
        private readonly assetDownloader: AssetDownloader,
    ) {
    }

    /**
     * @returns {number}
     */
    get id(): number {
        const chapterId = this.url.pathname.match(/chapter\/(?<id>\d+)\/?/);
        if (!chapterId?.groups) {
            throw new Error('chapter id not found');
        }
        return parseInt(chapterId.groups.id)
    }

    @Memoize()
    public async load(): Promise<typeof this> {
        if (!await this.loadFromCache()) {
            await this.loadFromWeb()
            await this.writeToCache()
        }

        eventEmitter.emit(chapterLoaded, new ChapterLoadedEvent(this))
        return this;
    }

    private async loadFromWeb(): Promise<void> {
        let tries = 0
        let $
        do {
            const response = await fetch(this.url.toString())
            $ = cheerio.load(await response.text())
            this.title = $('.chapter-title').text()
        } while (!this.title && tries++ < 3)

        if (!this.title) {
            throw new Error(`Could not download chapter ${this.url.toString()}`)
        }

        await this.assetDownloader.fetchImagesFromQuery($, '#chp_contents img[src]')
        this.text = cleanContents($('#chp_raw')).html()!
    }

    public async loadFromCache(): Promise<boolean> {
        try {
            const data = JSON.parse(await fileCache.readString(this.cacheFilePath))

            if (!data.url || !data.index || !data.title || !data.text) {
                return false
            }
            this.url = new URL(data.url)
            this.index = data.index
            this.title = data.title
            this.text = data.text

            eventEmitter.emit(chapterLoadedFromCache, new ChapterLoadedFromCacheEvent(this))
            return true
        } catch {
            return false
        }
    }

    private async writeToCache(): Promise<void> {
        await fileCache.writeString(this.cacheFilePath, JSON.stringify({
            url: this.url.toString(),
            index: this.index,
            title: this.title,
            text: this.text
        }))
        eventEmitter.emit(chapterWrittenToCache, new ChapterWrittenToCacheEvent(this))
    }

    private get cacheFilePath(): string {
        return path.resolve(this.cacheDir, this.id + '.json.brotli')
    }
}
