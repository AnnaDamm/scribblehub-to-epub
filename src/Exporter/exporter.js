import EPub from 'epub-gen'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { eventEmitter } from '../Events/event-emitter.js'
import { exportStarted, ExportStartedEvent } from '../Events/export-started.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const assetPath = path.resolve(__dirname, '..', '..', 'assets')

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
   * @param {string} outputFile
   * @param {Object.<string, any>} extraOptions
   * @returns {Promise<void>}
   */
  async export (assetDownloader, book, outputFile, extraOptions) {
    eventEmitter.emit(exportStarted, new ExportStartedEvent(book))

    const bookMetaData = await book.getBookMetaData()

    const exportOptions = {
      title: bookMetaData.title,
      author: bookMetaData.authorName,
      publisher: bookMetaData.publisher,
      cover: await book.loadCover(assetDownloader),
      appendChapterTitles: true,
      content: await this.buildContent(book),
      css: fs.readFileSync(path.resolve(assetPath, 'styles', 'styles.css')),
      customNcxTocTemplatePath: path.resolve(assetPath, 'templates', 'toc.ncx.ejs'),
      ...extraOptions
    }

    const epub = new EPub(exportOptions, outputFile)
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
      title: 'Synopsis',
      data: bookMetadata.details,
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
