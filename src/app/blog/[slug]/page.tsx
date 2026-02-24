import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog'
import { BlogLayout } from '@/components/blog/BlogLayout'
import { CodeBlock } from '@/components/blog/CodeBlock'
import { generateAllJsonLd } from '@/lib/json-ld'
import { StructuredData } from './StructuredData'
import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found' }

  const { metadata } = post
  return {
    title: `${metadata.title} | GeoWatch Blog`,
    description: metadata.description,
    authors: metadata.author ? [{ name: metadata.author }] : undefined,
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      type: 'article',
      publishedTime: metadata.date,
      authors: metadata.author ? [metadata.author] : undefined,
      tags: metadata.tags,
      images: metadata.image ? [{ url: metadata.image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  }
}

const components = {
  h1: ({ children, ...props }: React.ComponentProps<'h1'>) => (
    <h1
      className="text-4xl md:text-5xl font-bold mt-12 mb-6 text-white tracking-tight scroll-mt-24"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.ComponentProps<'h2'>) => (
    <h2
      className="text-3xl md:text-4xl font-bold mt-14 mb-6 text-white tracking-tight scroll-mt-24 border-b border-zinc-700/40 pb-3"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.ComponentProps<'h3'>) => (
    <h3
      className="text-2xl md:text-3xl font-bold mt-10 mb-4 text-white tracking-tight scroll-mt-24"
      {...props}
    >
      {children}
    </h3>
  ),
  h4: ({ children, ...props }: React.ComponentProps<'h4'>) => (
    <h4
      className="text-xl md:text-2xl font-semibold mt-8 mb-4 text-white/90 scroll-mt-24"
      {...props}
    >
      {children}
    </h4>
  ),
  p: ({ children, ...props }: React.ComponentProps<'p'>) => (
    <p className="mb-6 leading-relaxed text-white/70 text-lg" {...props}>
      {children}
    </p>
  ),
  a: ({ href, children, ...props }: React.ComponentProps<'a'>) => {
    const isExternal = href?.startsWith('http')
    return (
      <Link
        href={href || '#'}
        className="text-cyan-400 hover:text-cyan-300 font-medium underline decoration-cyan-700 underline-offset-2 hover:decoration-cyan-400 transition-colors"
        target={isExternal ? '_blank' : undefined}
        rel={isExternal ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </Link>
    )
  },
  code: ({ children, ...props }: React.ComponentProps<'code'>) => (
    <code
      className="bg-cyan-950/30 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-400 font-medium border border-cyan-800/50"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: any) => {
    const codeContent =
      typeof children === 'object' && children?.props?.children
        ? children.props.children
        : children
    return <CodeBlock {...props}>{codeContent}</CodeBlock>
  },
  blockquote: ({ children, ...props }: React.ComponentProps<'blockquote'>) => (
    <blockquote
      className="relative border-l-4 border-cyan-500 pl-6 py-4 my-8 italic text-white/60 bg-cyan-950/10 rounded-r-lg"
      {...props}
    >
      {children}
    </blockquote>
  ),
  ul: ({ children, ...props }: React.ComponentProps<'ul'>) => (
    <ul className="space-y-3 mb-6 text-white/70 ml-6 list-disc" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.ComponentProps<'ol'>) => (
    <ol className="space-y-3 mb-6 text-white/70 ml-6 list-decimal" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentProps<'li'>) => (
    <li className="leading-relaxed pl-2" {...props}>
      {children}
    </li>
  ),
  table: ({ children, ...props }: React.ComponentProps<'table'>) => (
    <div className="overflow-x-auto mb-8 rounded-xl border border-zinc-700/60">
      <table className="min-w-full divide-y divide-zinc-700" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.ComponentProps<'th'>) => (
    <th
      className="px-6 py-4 bg-zinc-800/80 text-left text-sm font-bold text-white uppercase tracking-wide"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.ComponentProps<'td'>) => (
    <td
      className="px-6 py-4 border-t border-zinc-700/40 text-sm text-white/70"
      {...props}
    >
      {children}
    </td>
  ),
  strong: ({ children, ...props }: React.ComponentProps<'strong'>) => (
    <strong className="text-white font-semibold" {...props}>
      {children}
    </strong>
  ),
  hr: ({ ...props }: React.ComponentProps<'hr'>) => (
    <hr className="my-12 border-zinc-700/40" {...props} />
  ),
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const jsonLdData = generateAllJsonLd(post.metadata, post.slug)

  const schemas = Object.entries(jsonLdData)
    .filter(([, schema]) => schema)
    .map(([key, schema]) => ({ key, json: JSON.stringify(schema) }))

  return (
    <>
      {schemas.map(({ key, json }) => (
        <script
          key={key}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json }}
          data-rsc-json-ld={key}
        />
      ))}

      <StructuredData schemaCount={schemas.length} />

      <BlogLayout metadata={post.metadata} readingTime={post.readingTime} slug={post.slug}>
        <MDXRemote
          source={post.content}
          components={components}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [
                rehypeSlug,
                [
                  rehypeAutolinkHeadings,
                  {
                    behavior: 'wrap',
                    properties: { className: ['anchor-link'] },
                  },
                ],
              ],
            },
          }}
        />
      </BlogLayout>
    </>
  )
}
