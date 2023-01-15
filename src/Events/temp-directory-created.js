import { BaseEvent } from './base-event.js'

export const tempDirectoryCreated = Symbol('tempDirectoryCreated')

/**
 * @property {URL} url
 */
export class TempDirectoryCreated extends BaseEvent {
  /**
   * @param {string} tmpDir
   */
  constructor (tmpDir) {
    super()
    this.tmpDir = tmpDir
  }
}
