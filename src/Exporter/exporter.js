import EPub from 'epub-gen'
import { eventEmitter } from '../Events/event-emitter.js'
import { exportStarted, ExportStartedEvent } from '../Events/export-started.js'

/**
 * @typedef {Object} EpubChapter
 * @property {string|undefined} title
 * @property {string|undefined} author
 * @property {string} data
 * @property {boolean|undefined} excludeFromToc
 * @property {boolean|undefined} beforeToc
 * @property {string|undefined} filename
 */
export class Exporter {
  /**
   * @param {AssetDownloader} assetDownloader
   * @param {Book} book
   * @param {string} outFile
   * @returns {Promise<void>}
   */
  async export (assetDownloader, book, outFile) {
    eventEmitter.emit(exportStarted, new ExportStartedEvent(book))

    const bookMetaData = await book.getBookMetaData()

    const exportOptions = {
      title: bookMetaData.title,
      author: bookMetaData.authorName,
      publisher: bookMetaData.publisher,
      cover: await book.loadCover(assetDownloader),
      output: outFile,
      appendChapterTitles: true,
      content: await this.buildContent(book)
    }

    const epub = new EPub(exportOptions, outFile)
    await epub.promise
  }

  /**
   * @param {Book} book
   * @returns {Promise<EpubChapter[]>}
   */
  async buildContent (book) {
    /** @type {EpubChapter[]} chapters */
    const chapters = [
      this.buildDetailsChapter(await book.getBookMetaData())
    ]
    const bookChapters = await book.loadChapters()
    for (const chapter of bookChapters) {
      chapters.push(this.buildChapter(chapter))
    }

    return chapters
  }

  /**
   * @param {BookMetadata} bookMetadata
   * @returns EpubChapter
   * @private
   */
  buildDetailsChapter (bookMetadata) {
    return {
      data: bookMetadata.details,
      excludeFromToc: true,
      beforeToc: true,
      filename: 'synopsis.html'
    }
  }

  /**
   * @param {Chapter} chapter
   * @returns EpubChapter
   * @private
   */
  buildChapter (chapter) {
    return {
      title: chapter.title,
      data: chapter.text,
      filename: `chapter-${chapter.id}.html`
    }
  }
}
