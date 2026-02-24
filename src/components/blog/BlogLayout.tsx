'use client'

import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Twitter, Linkedin } from 'lucide-react'
import Navbar from '@/components/Navbar'
import type { BlogPostMetadata } from '@/lib/blog'
import { getAuthorByName, getDefaultAuthor, type Author } from '@/lib/author'
import { TableOfContents } from './TableOfContents'

interface BlogLayoutProps {
  children: React.ReactNode
  metadata: BlogPostMetadata
  readingTime: string
  slug: string
}

function getAuthor(authorName?: string): Author {
  if (authorName) {
    const author = getAuthorByName(authorName)
    if (author) return author
  }
  return getDefaultAuthor()
}

export function BlogLayout({ children, metadata, readingTime }: BlogLayoutProps) {
  const formattedDate = new Date(metadata.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const author = getAuthor(metadata.author)

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Navbar */}
      <Navbar />

      {/* Table of Contents */}
      <TableOfContents />

      {/* Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Article Header */}
        <header className="mb-12">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/45 hover:text-cyan-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">All posts</span>
          </Link>

          {/* Tags */}
          {metadata.tags && metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm font-medium border border-cyan-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-[1.1] tracking-tight">
            {metadata.title}
          </h1>

          {/* Description */}
          {metadata.description && (
            <p className="text-xl text-white/60 mb-8 leading-relaxed max-w-3xl">
              {metadata.description}
            </p>
          )}

          {/* Meta bar */}
          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-white/45 pb-8 border-b border-zinc-700/40">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <time dateTime={metadata.date} className="font-medium">
                {formattedDate}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span className="font-medium">{readingTime}</span>
            </div>
            {metadata.author && (
              <span className="font-medium">By {metadata.author}</span>
            )}
          </div>
        </header>

        {/* Article Content */}
        <div className="prose-geowatch">
          {children}
        </div>

        {/* Author Bio */}
        <div className="mt-16 p-6 md:p-8 bg-zinc-900 rounded-2xl border border-zinc-700/60">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="flex-1">
              <p className="text-sm text-white/45 uppercase tracking-wide font-medium mb-1">
                Written by
              </p>
              <p className="text-xl font-bold text-white">{author.name}</p>
              <p className="text-sm text-cyan-400 font-medium mb-3">
                {author.role} at {author.company}
              </p>
              <p className="text-white/60 text-sm leading-relaxed mb-4">
                {author.bio}
              </p>
              <div className="flex gap-3">
                {author.socialLinks.twitter && (
                  <a
                    href={author.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-white/45 hover:text-cyan-400 transition-colors"
                  >
                    <Twitter className="h-4 w-4" />
                    <span>Twitter</span>
                  </a>
                )}
                {author.socialLinks.linkedin && (
                  <a
                    href={author.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm text-white/45 hover:text-cyan-400 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer nav */}
        <footer className="mt-16 pt-8 border-t border-zinc-700/40">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-semibold group transition-colors"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>View all posts</span>
          </Link>
        </footer>
      </article>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white mt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to track your AI search visibility?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Monitor your brand across ChatGPT, Perplexity, and Google AI Overviews with GeoWatch.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 bg-white text-cyan-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg shadow-xl transition-all hover:scale-105"
          >
            Start Monitoring
          </Link>
        </div>
      </section>
    </div>
  )
}
