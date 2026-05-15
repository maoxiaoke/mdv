# mdv

Render Markdown with **MDX** (`@mdx-js/mdx`) and React.

This repo provides:

- A small library API: compile Markdown/MDX to a React component or to HTML.
- A tiny CLI (`mdv`) to render a `.md/.mdx` file to HTML.

## Install

```bash
npm i mdv
```

## Library usage

```ts
import { renderMarkdownToHtml } from 'mdv'

const html = await renderMarkdownToHtml(`# Hello\n\n**bold**`)
console.log(html)
```

## CLI usage

```bash
# to stdout
npx mdv README.md

# write to file
npx mdv README.md -o out.html

# from stdin
cat README.md | npx mdv --stdin
```

## Notes

- Uses `remark-gfm` by default.
- Adds heading `id` via `rehype-slug` and autolinks headings via `rehype-autolink-headings`.
- Requires Node.js >= 18.
