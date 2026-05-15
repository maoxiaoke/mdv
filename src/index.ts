import React from 'react'
import { compile } from '@mdx-js/mdx'
import { MDXProvider, useMDXComponents } from '@mdx-js/react'
import * as jsxRuntime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import { renderToStaticMarkup } from 'react-dom/server'
import type { CompileOptions } from '@mdx-js/mdx'

export type MdxComponents = React.ComponentProps<typeof MDXProvider>['components']

export type MdxRenderOptions = {
  /**
   * Custom React components mapping for MDX elements.
   *
   * Example: { a: (props) => <a {...props} className="link" /> }
   */
  components?: MdxComponents
  /**
   * Extra MDX compile options.
   *
   * Note: this library always enables `remark-gfm`, `rehype-slug`, and
   * `rehype-autolink-headings` by default.
   */
  mdxOptions?: CompileOptions
}

function mergePlugins<T>(base: T[], extra: unknown): T[] {
  const more = (Array.isArray(extra) ? extra : []) as T[]
  return [...base, ...more]
}

/**
 * Compile a Markdown/MDX string into a React component.
 *
 * Uses `@mdx-js/mdx` in `function-body` mode, so it works in Node without a bundler.
 */
export async function compileMarkdownToComponent(
  source: string,
  mdxOptions: CompileOptions = {}
): Promise<React.ComponentType> {
  const {
    remarkPlugins,
    rehypePlugins,
    // We'll re-apply these with our defaults below.
    outputFormat: _outputFormat,
    providerImportSource: _providerImportSource,
    ...rest
  } = mdxOptions

  const compiled = await compile(source, {
    ...rest,
    outputFormat: 'function-body',
    providerImportSource: '@mdx-js/react',
    remarkPlugins: mergePlugins([remarkGfm], remarkPlugins),
    rehypePlugins: mergePlugins(
      [
        rehypeSlug,
        // Wrap headings with links.
        [rehypeAutolinkHeadings, { behavior: 'wrap' }]
      ],
      rehypePlugins
    )
  })

  // `function-body` returns JS code that expects the JSX runtime in `arguments[0]`.
  // It returns `{ default: MDXContent }`.
  const fn = new Function(String(compiled)) as (runtime: unknown) => {
    default: React.ComponentType
  }

  const mod = fn({
    ...jsxRuntime,
    useMDXComponents
  })

  return mod.default
}

/**
 * Render Markdown/MDX to a React element.
 */
export async function renderMarkdownToReact(
  source: string,
  options: MdxRenderOptions = {}
): Promise<React.ReactElement> {
  const Content = await compileMarkdownToComponent(source, options.mdxOptions)

  if (options.components) {
    return React.createElement(
      MDXProvider,
      { components: options.components },
      React.createElement(Content)
    )
  }

  return React.createElement(Content)
}

/**
 * Render Markdown/MDX to an HTML string (static markup).
 */
export async function renderMarkdownToHtml(
  source: string,
  options: MdxRenderOptions = {}
): Promise<string> {
  const element = await renderMarkdownToReact(source, options)
  return renderToStaticMarkup(element)
}
