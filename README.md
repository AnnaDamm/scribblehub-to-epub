# Scribblehub-to-epub
This program scrapes a single story of [Scribblehub](https://www.scribblehub.com) and exports it as a book in epub format.
The epub can be read by most ebook readers, such as Kindle.

## Installation
TODO

## Usage
`<scribblehub-url>` refers to the main page of a story, looking like this: `https://www.scribblehub.com/series/<id>/<name>/,`
e.g: `https://www.scribblehub.com/series/36420/the-fastest-man-alive/`.

```bash
npm run run <scribblehub-url>
```

### All CLI Parameters:
```bash
Arguments:
  url                 base url of the Scribble Hub series, e.g. "https://www.scribblehub.com/series/36420/the-fastest-man-alive/"
  out-file            file name of the generated epub, defaults to "dist/<book-url-slug>.epub"

Options:
  -v, --verbose       verbosity that can be increased (-v, -vv, -vvv)
  -q, --quiet         do not output anything (default: false)
  -o, --overwrite     overwrite the [out-file] if it already exists
  -O, --no-overwrite  do not overwrite the [out-file] if it already exists
  -P, --no-progress   do not show a progress bar
  --tmp-dir <dir>     Temp directory, default: C:\Users\valys\AppData\Local\Temp (default: "C:\\Users\\valys\\AppData\\Local\\Temp")
  -h, --help          display help for command
```

## Report bugs and feature requests
Report any bugs and feature requests on [Github Issues](https://github.com/AnnaDamm/scribblehub-to-epub/issues)

## Contribute
Clone github and install dependencies:
```bash
git clone https://github.com/AnnaDamm/scribblehub-to-epub.git
cd scribblehub-to-epub
npm ci
```
