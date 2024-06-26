
# Scribblehub-to-epub

---

**NOT WORKING ANY LONGER**

Cloudflare bot detection has made it impossible for me to make this script working any longer.
In previous times, it was possible to just use a normal fetch on scribblehub to get web pages.
This is no longer possible.
I have tried many things but could not get around the bot detection,
not without using some payed proxies specifically for scraping,
which is really slow and unreliable at best.

I suggest using a chrome extension like [WebToEpub](https://chromewebstore.google.com/detail/webtoepub/akiljllkbielkidmammnifcnibaigelm)
which runs directly and chrome and as such, does not suffer from bot detection as much.

---

This program scrapes a single story of [Scribblehub](https://www.scribblehub.com)
and exports it as a book in epub format.
The epub can be read by most ebook readers, such as Kindle.

## Installation

```bash
npm install -g @annadamm/scribblehub-to-epub
```

## Usage

```bash
scribblehub-to-epub <scribblehub-url>
# get all available options:
scribblehub-to-epub --help
```

`<scribblehub-url>` refers to the main page of a story, looking like this: `https://www.scribblehub.com/series/<id>/<name>/,`
e.g: `https://www.scribblehub.com/series/36420/the-fastest-man-alive/`.
If you use a chapter url instead of a main url, it will start downloading from that chapter.

### All CLI Parameters

```text
Usage: scribble-to-epub [options] <url> [out-file]

Downloads a book from scribblehub.com and outputs it as an epub file

Arguments:
  url                         base url of the Scribble Hub series
                              (e.g. "https://www.scribblehub.com/series/36420/the-fastest-man-alive/).
                              Using a url of a chapter instead of the main page will start downloading on that chapter,
                              overriding the "start-with" option
  out-file                    file name of the generated epub, defaults to "dist/<book-url-slug>.epub"

Options:
  -V, --version               output the version number
  -s, --start-with <chapter>  Chapter index to start with.
                              Will be ignored when the <url> parameter is a chapter url (default: 1)
  -e, --end-with <chapter>    Chapter index to end with, defaults to the end of the book
  -o, --overwrite             overwrite the [out-file] if it already exists
  -O, --no-overwrite          do not overwrite the [out-file] if it already exists
  -P, --no-progress           do not show a progress bar
  -v, --verbose               verbosity that can be increased (-v, -vv, -vvv)
  -q, --quiet                 do not output anything (default: false)
  --cache-dir <dir>           Cache directory (default: "~/node_modules/.cache/scribblehub-to-epub")
  -h, --help                  display help for command
```

## Changelog

See changes between versions in the [Changelog](CHANGELOG.md).

## Report bugs and feature requests

Report any bugs and feature requests on [GitHub Issues](https://github.com/AnnaDamm/scribblehub-to-epub/issues)

## Contribute

Clone GitHub and install dependencies:

```bash
git clone https://github.com/AnnaDamm/scribblehub-to-epub.git
cd scribblehub-to-epub
npm ci
```
