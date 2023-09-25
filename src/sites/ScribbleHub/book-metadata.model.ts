import { BookMetadata as BaseBookMetadata } from '../Base/book.models.js';

export interface BookMetadata extends BaseBookMetadata {
    readonly postId: number,
    readonly authorId: number,
}
