import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import type { BlogPost } from '@/lib/blog'

interface BlogCardProps {
  post: BlogPost
}

export function BlogCard({ post }: BlogCardProps) {
  const formattedDate = new Date(post.metadata.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <article className="relative bg-zinc-900 rounded-2xl border border-zinc-700/60 overflow-hidden hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1 cursor-pointer">
        {/* Gradient accent bar on hover */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative p-8">
          {/* Tags */}
          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.metadata.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-xs font-medium border border-cyan-500/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 transition-all duration-300 leading-tight">
            {post.metadata.title}
          </h2>

          {/* Description */}
          {post.metadata.description && (
            <p className="text-white/60 mb-6 leading-relaxed line-clamp-3 text-base">
              {post.metadata.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/45 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-cyan-400" />
              <time dateTime={post.metadata.date}>{formattedDate}</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>{post.readingTime}</span>
            </div>
          </div>

          {/* Read More */}
          <div className="flex items-center gap-2 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
            <span>Read Article</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </article>
    </Link>
  )
}
