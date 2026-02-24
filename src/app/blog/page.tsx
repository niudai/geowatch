import { Metadata } from 'next'
import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { BlogCard } from '@/components/blog/BlogCard'
import { JsonLdScript } from '@/components/blog/JsonLd'
import { BookOpen } from 'lucide-react'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'Blog | GeoWatch',
  description:
    'Insights, guides, and comparisons on GEO monitoring, AI search visibility, and generative engine optimization.',
  openGraph: {
    title: 'Blog | GeoWatch',
    description:
      'Insights, guides, and comparisons on GEO monitoring, AI search visibility, and generative engine optimization.',
    type: 'website',
    siteName: 'GeoWatch',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | GeoWatch',
    description:
      'Insights, guides, and comparisons on GEO monitoring, AI search visibility, and generative engine optimization.',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  const baseUrl = 'https://geowatch.ai'
  const blogListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'GeoWatch Blog',
    description:
      'Expert insights on GEO monitoring, AI search visibility, and generative engine optimization',
    url: `${baseUrl}/blog`,
    publisher: {
      '@type': 'Organization',
      name: 'GeoWatch',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.svg`,
      },
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      '@type': 'BlogPosting',
      headline: post.metadata.title,
      description: post.metadata.description,
      datePublished: post.metadata.date,
      url: `${baseUrl}/blog/${post.slug}`,
    })),
  }

  return (
    <>
      <JsonLdScript data={blogListJsonLd} />

      <div className="min-h-screen bg-[#050508]">
        <Navbar />

        {/* Hero */}
        <div className="pt-28 pb-12 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-white/45 hover:text-cyan-400 transition-colors text-sm mb-8"
          >
            &larr; Home
          </Link>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Blog</h1>
          <p className="text-xl text-white/60 max-w-2xl leading-relaxed">
            Guides, comparisons, and insights on AI search visibility and generative engine optimization.
          </p>
        </div>

        {/* Posts Grid */}
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900 rounded-2xl border border-zinc-700/60">
              <BookOpen className="h-16 w-16 mx-auto text-cyan-400 mb-6" />
              <h2 className="text-3xl font-bold text-white mb-3">No posts yet</h2>
              <p className="text-lg text-white/45 max-w-md mx-auto">
                We&apos;re crafting content for you. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-800 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-sm text-white/30">
              &copy; {new Date().getFullYear()} GeoWatch. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  )
}
