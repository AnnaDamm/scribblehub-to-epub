import Cheerio = cheerio.Cheerio;

export function cleanContents(contents: Cheerio): Cheerio {
    removeAds(contents)
    removeComments(contents)
    exchangeFootnotes(contents)

    return contents
}

function removeAds(contents: Cheerio): void {
    contents.find('[class^="ad_"], [id^="div-gpt-ad"]').remove()
}

function removeComments(contents: Cheerio): void {
    contents.find('*').contents().filter((_, node) => isComment(node)).remove()
}

function exchangeFootnotes(contents: Cheerio): void {
    const footNotes: Cheerio[] = [];
    contents.find('.modern-footnotes-footnote').each((_, node) => {
        if (!isTag(node)) {
            return;
        }
        const mfn = node.attribs['data-mfn'];

        const anchor = node.children.findLast((element) => isTag(element) && element.tagName === 'a');
        const contentNodeElement = contents.find(`.modern-footnotes-footnote__note[data-mfn=${mfn}]`);
        const contentNode = contentNodeElement[0];
        if (
            !anchor || !isTag(anchor)
            || !contentNodeElement || !isTag(contentNode)
        ) {
            return;
        }

        anchor.attribs['id'] = `noteanchor-${mfn}`;
        anchor.attribs['href'] = `#note-${mfn}`;
        anchor.attribs['epub:type'] = 'noteref';

        contentNode.tagName = 'aside';
        contentNode.attribs['id'] = `note-${mfn}`;
        contentNode.attribs['epub:type'] = 'footnote';
        contentNodeElement.prepend(`<a href="#noteanchor-${mfn}">${mfn}.</a>&nbsp;`)

        footNotes.push(contentNodeElement);
    });
    if (footNotes.length > 0) {
        const lastParagraph = contents.find('p').last();
        lastParagraph.after(`<h2 id="footnotes">Footnotes</h2>`, footNotes);
    }
}

function isComment(node: cheerio.Element): node is cheerio.CommentElement {
    return node.type === 'comment';
}

function isTag(node: cheerio.Element): node is cheerio.TagElement {
    return node.type === 'tag';
}
