import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'
import type { JsonLdConfig } from './json-ld'

const postsDirectory = path.join(process.cwd(), 'content/blog')

export interface BlogPostMetadata {
  title: string
  description: string
  date: string
  author?: string
  authorBio?: string
  tags?: string[]
  image?: string
  published?: boolean
  jsonLd?: JsonLdConfig
}

export interface BlogPost {
  slug: string
  metadata: BlogPostMetadata
  content: string
  readingTime: string
}

function ensureBlogDirectory() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
}

export function getAllPostSlugs(): string[] {
  ensureBlogDirectory()
  const files = fs.readdirSync(postsDirectory)
  return files
    .filter((file) => file.endsWith('.mdx') || file.endsWith('.md'))
    .map((file) => file.replace(/\.mdx?$/, ''))
}

export function getPostBySlug(slug: string): BlogPost | null {
  ensureBlogDirectory()

  const fullPathMdx = path.join(postsDirectory, `${slug}.mdx`)
  const fullPathMd = path.join(postsDirectory, `${slug}.md`)

  let fullPath: string | null = null
  if (fs.existsSync(fullPathMdx)) {
    fullPath = fullPathMdx
  } else if (fs.existsSync(fullPathMd)) {
    fullPath = fullPathMd
  }

  if (!fullPath) return null

  const fileContents = fs.readFileSync(fullPath, 'utf8')
  const { data, content } = matter(fileContents)
  const metadata = data as BlogPostMetadata
  const stats = readingTime(content)

  return {
    slug,
    metadata,
    content,
    readingTime: stats.text,
  }
}

export function getAllPosts(): BlogPost[] {
  const slugs = getAllPostSlugs()
  return slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .filter((post) => {
      if (process.env.NODE_ENV === 'production') {
        return post.metadata.published !== false
      }
      return true
    })
    .filter((post) => !isNaN(new Date(post.metadata.date).getTime()))
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getAllPosts().filter((post) => post.metadata.tags?.includes(tag))
}

export function getAllTags(): string[] {
  const tags = new Set<string>()
  getAllPosts().forEach((post) => post.metadata.tags?.forEach((tag) => tags.add(tag)))
  return Array.from(tags).sort()
}
