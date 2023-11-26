import cheerio from 'cheerio';
import { cleanContents } from './clean-contents.js';
import { MetadataLoader as BaseMetaDataLoader } from '../Base/metadata-loader.js'
import { BookMetadata } from './book-metadata.model.js';

export class MetadataLoader extends BaseMetaDataLoader<BookMetadata> {
    protected async loadData(url: URL): Promise<BookMetadata> {
        const page = await fetch(url.toString())
        const html = await page.text()
        const $ = cheerio.load(html)

        const canonicalUrl = new URL($('meta[property="og:url"]').attr('content')!);
        const slug = canonicalUrl.toString().match(/.+\/(?<slug>.+?)\/$/)?.groups?.slug;
        const title = $('meta[property="og:title"]').attr('content');
        const coverUrl = new URL($('meta[property="og:image"]').attr('content') ?? '');
        const date = this.parseUpdatedDate($('span[title^="Last updated:"]').attr('title'));
        const description = $('meta[property="og:description"]').attr('content')!;
        const postId = parseInt($('#mypostid').val(), 10);
        const authorName = $('meta[name="twitter:creator"]').attr('content')!;
        const publisher = $('meta[property="og:site_name"]').attr('content')!;
        const synopsis = cleanContents($('.fic_row.details')).html()!;

        if (!slug) {
            throw new Error('slug not found');
        }
        if (!title) {
            throw new Error('title not found');
        }

        return {
            canonicalUrl,
            slug,
            title,
            coverUrl,
            date,
            description,
            postId,
            authorName,
            publisher,
            synopsis,
        }
    }

    private parseUpdatedDate(dateString?: string): Date {
        if (!dateString) {
            return new Date();
        }
        let date = new Date(dateString.replace(/^Last updated: /, ''))
        if (date.toString() !== 'Invalid Date') {
            return date
        }
        date = new Date()
        let matches = dateString.match(/(?<hours>\d+) hours ago/)
        if (matches !== null && matches.groups?.hours !== undefined) {
            date.setHours(date.getHours() - parseInt(matches.groups.hours, 10))
            return date
        }
        matches = dateString.match(/(?<minutes>\d+) minutes ago/)
        if (matches !== null && matches.groups?.minutes !== undefined) {
            date.setMinutes(date.setMinutes(0) - parseInt(matches.groups.minutes, 10))
            return date
        }

        return date
    }
}