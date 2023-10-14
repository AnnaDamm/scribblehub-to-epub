import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { eventEmitter } from '../Events/event-emitter.js'
import { exportStarted, ExportStartedEvent } from '../Events/export-started.js'
import { EPub } from 'epub-gen-memory'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const assetPath = path.resolve(__dirname, '..', '..', 'assets')

/**
 * @typedef {Object} EpubChapter
 * @property {string|undefined} title;
 * @property {string|string[]|undefined} author
 * @property {string} content
 * @property {boolean|undefined} excludeFromToc
 * @property {boolean|undefined} beforeToc
 * @property {string|undefined} filename
 * @property {string|undefined} url
 */
export class Exporter {
  /**
   * @param {Book} book
   * @param {string} outputFile
   * @param {Object.<string, any>} extraOptions
   * @returns {Promise<void>}
   */
  async export (book, outputFile, extraOptions) {
    eventEmitter.emit(exportStarted, new ExportStartedEvent(book))

    const bookMetaData = await book.getBookMetaData()

    const epub = new EPub({
      title: bookMetaData.title,
      author: bookMetaData.authorName,
      publisher: bookMetaData.publisher,
      description: bookMetaData.description,
      cover: 'file://' + await book.getCover(),
      numberChaptersInTOC: false,
      date: bookMetaData.date.toISOString(),
      css: fs.readFileSync(path.resolve(assetPath, 'styles', 'scribblehub.css')).toString(),
      ...extraOptions
    }, await this.buildContent(book))

    const dataBuffer = await epub.genEpub()

    fs.writeFileSync(outputFile, dataBuffer)
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
    const bookChapters = await book.chapters
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
      content: bookMetadata.details,
      filename: 'synopsis.html',
      beforeToc: true
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
      content: chapter.text,
      filename: `chapter-${chapter.index}.html`
    }
  }
}
