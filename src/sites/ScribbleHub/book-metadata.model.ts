import { BookMetadata as BaseBookMetadata } from '../Base/book.models';

export interface BookMetadata extends BaseBookMetadata {
    postId: number,
}
