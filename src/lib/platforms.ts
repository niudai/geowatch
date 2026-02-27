export interface Platform {
  key: string
  label: string
  shortLabel: string
}

export const SUPPORTED_PLATFORMS: Platform[] = [
  { key: 'google_ai_mode', label: 'Google AI Mode', shortLabel: 'Google AI' },
  { key: 'chatgpt', label: 'ChatGPT', shortLabel: 'ChatGPT' },
]

export const COMING_SOON_PLATFORMS: Platform[] = [
  { key: 'perplexity', label: 'Perplexity', shortLabel: 'Perplexity' },
  { key: 'claude', label: 'Claude', shortLabel: 'Claude' },
  { key: 'gemini', label: 'Gemini', shortLabel: 'Gemini' },
]

/** Map a source key (e.g. 'google_ai_mode') to its display label */
export function getSourceLabel(source: string): string {
  const all = [...SUPPORTED_PLATFORMS, ...COMING_SOON_PLATFORMS]
  return all.find((p) => p.key === source)?.label ?? source
}

/** e.g. "Google AI Mode and ChatGPT" */
export function supportedPlatformNames(): string {
  const names = SUPPORTED_PLATFORMS.map((p) => p.label)
  if (names.length <= 1) return names.join('')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
