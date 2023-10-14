import { BookMetadata as BaseBookMetadata } from '../Base/book.models.js';

export interface BookMetadata extends BaseBookMetadata {
    postId: number,
    authorId: number,
}
