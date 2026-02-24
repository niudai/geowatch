'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { List } from 'lucide-react'

interface TocItem {
  id: string
  text: string
  level: number
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const elements = article.querySelectorAll('h2, h3')
    const items: TocItem[] = Array.from(elements)
      .filter((element) => element.id)
      .map((element) => ({
        id: element.id,
        text: element.textContent || '',
        level: parseInt(element.tagName.charAt(1)),
      }))

    setHeadings(items)
  }, [])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0% -80% 0%', threshold: 0 }
    )

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [headings])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
    }
  }

  if (headings.length === 0) return null

  return (
    <nav
      className="hidden xl:block fixed right-8 top-28 w-64 max-h-[calc(100vh-8rem)] overflow-y-auto z-40 bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/40 rounded-xl p-4"
      aria-label="Table of contents"
    >
      <div className="flex items-center gap-2 mb-3">
        <List className="h-4 w-4 text-white/45" />
        <span className="text-sm font-medium text-white/45">On this page</span>
      </div>

      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: heading.level === 3 ? '0.75rem' : '0' }}
          >
            <button
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                'block w-full text-left py-1 transition-colors duration-150',
                'hover:text-cyan-400',
                activeId === heading.id
                  ? 'text-cyan-400 font-medium'
                  : 'text-white/45',
                heading.level === 3 && 'text-xs'
              )}
            >
              <span className="line-clamp-2">{heading.text}</span>
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-4 text-xs text-white/30 hover:text-cyan-400 transition-colors flex items-center gap-1"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        Back to top
      </button>
    </nav>
  )
}
