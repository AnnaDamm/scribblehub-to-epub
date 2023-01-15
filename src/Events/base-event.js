export class BaseEvent {
  /**
   * @returns {string}
   */
  toString () {
    return this.constructor.name
  }
}
