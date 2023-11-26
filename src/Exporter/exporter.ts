import {Chapter, EPub, Options} from 'epub-gen-memory'
import fs from 'fs'
import {eventEmitter} from '../Events/event-emitter.js'
import {exportStarted, ExportStartedEvent} from '../Events/export-started.js'
import {Book, BookMetadata, Chapter as ChapterModel} from '../sites/Base/book.models.js';

export class Exporter {
    public async export(book: Book, outputFile: string, extraOptions: Partial<Options>): Promise<void> {
        eventEmitter.emit(exportStarted, new ExportStartedEvent(book));

        const bookMetaData = await book.getBookMetaData();

        const epub = new EPub({
            title: bookMetaData.title,
            author: bookMetaData.authorName,
            publisher: bookMetaData.publisher,
            description: bookMetaData.description,
            cover: 'file://' + await book.getCover(),
            numberChaptersInTOC: false,
            date: bookMetaData.date.toISOString(),
            css: await book.getStyles(),
            ...extraOptions
        }, await this.buildContent(book))

        const dataBuffer = await epub.genEpub()

        await fs.promises.writeFile(outputFile, dataBuffer)
    }

    private async buildContent(book: Book): Promise<Chapter[]> {
        const chapters = [
            this.buildSynopsis(await book.getBookMetaData())
        ]
        const bookChapters = await book.getChapters()
        for (const chapter of bookChapters) {
            chapters.push(this.buildChapter(chapter))
        }

        return chapters
    }

    private buildSynopsis(bookMetadata: BookMetadata): Chapter {
        return {
            title: 'Synopsis',
            author: bookMetadata.authorName,
            content: bookMetadata.synopsis,
            filename: 'synopsis.html',
            beforeToc: true,
            excludeFromToc: true,
        }
    }

    private buildChapter(chapter: ChapterModel): Chapter {
        return {
            title: chapter.title,
            content: chapter.text,
            filename: `chapter-${chapter.index}.html`
        }
    }
}
