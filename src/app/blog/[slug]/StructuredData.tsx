'use client'

import { useEffect } from 'react'

export function StructuredData({ schemaCount }: { schemaCount: number }) {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const allScripts = document.querySelectorAll('script[type="application/ld+json"]')
        if (allScripts.length <= schemaCount) return

        const scriptsByKey = new Map<string, Element[]>()
        allScripts.forEach((script) => {
          const key = script.getAttribute('data-rsc-json-ld') || 'unknown'
          if (!scriptsByKey.has(key)) scriptsByKey.set(key, [])
          scriptsByKey.get(key)!.push(script)
        })

        scriptsByKey.forEach((scripts) => {
          if (scripts.length > 1) {
            scripts.slice(1).forEach((script) => {
              if (script.parentNode) script.parentNode.removeChild(script)
            })
          }
        })
      } catch {
        // Silently ignore cleanup errors
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [schemaCount])

  return null
}
