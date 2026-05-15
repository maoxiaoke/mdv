import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'
import { renderMarkdownToHtml } from './index.js'

function printHelp() {
  // Keep this minimal; this repo is a library-first implementation.
  process.stdout.write(`mdv - render Markdown/MDX to HTML using @mdx-js/mdx + React

Usage:
  mdv <input.md>            Render file to HTML (stdout)
  mdv --stdin               Read Markdown/MDX from stdin
  mdv <input.md> -o out.html  Write output to a file

Options:
  -o, --out <path>   Write HTML to file instead of stdout
  -h, --help         Show help
`)
}

async function readStdin(): Promise<string> {
  return await new Promise((resolve, reject) => {
    let data = ''
    process.stdin.setEncoding('utf8')
    process.stdin.on('data', (chunk) => (data += chunk))
    process.stdin.on('end', () => resolve(data))
    process.stdin.on('error', reject)
  })
}

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('-h') || args.includes('--help')) {
    printHelp()
    return
  }

  let outPath: string | undefined
  const outIdx = args.findIndex((a) => a === '-o' || a === '--out')
  if (outIdx !== -1) {
    outPath = args[outIdx + 1]
    if (!outPath) {
      throw new Error('Missing value for -o/--out')
    }
    args.splice(outIdx, 2)
  }

  const useStdin = args[0] === '--stdin'
  const inputPath = !useStdin ? args[0] : undefined

  if (!useStdin && !inputPath) {
    printHelp()
    process.exitCode = 1
    return
  }

  const source = useStdin ? await readStdin() : await readFile(inputPath!, 'utf8')
  const html = await renderMarkdownToHtml(source)

  if (outPath) {
    await writeFile(outPath, html, 'utf8')
  } else {
    process.stdout.write(html)
  }
}

main().catch((err) => {
  process.stderr.write(String(err?.stack || err) + '\n')
  process.exitCode = 1
})
