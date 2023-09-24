export class BaseEvent {
    toString(): string {
        return `${this.constructor.name}[${JSON.stringify(this)}]`
    }
}
