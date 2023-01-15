import { EventEmitter as BaseEventEmitter } from 'node:events'

export const allEvents = '*'
export const noOtherEventListeners = '!'

class EventEmitter extends BaseEventEmitter {
  emit (type, ...args) {
    super.emit('*', ...args)
    return super.emit(type, ...args) || super.emit('', ...args)
  }
}

export const eventEmitter = new EventEmitter()
