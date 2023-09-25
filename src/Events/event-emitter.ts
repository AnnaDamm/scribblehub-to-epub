import { EventEmitter as BaseEventEmitter } from 'node:events'

export const allEvents = '*'

class EventEmitter extends BaseEventEmitter {
    emit(type: string | symbol, ...args: unknown[]) {
        super.emit(allEvents, ...args)
        return super.emit(type, ...args) || super.emit('', ...args)
    }
}

export const eventEmitter = new EventEmitter()
