export interface Author {
  name: string
  slug: string
  avatar: string
  bio: string
  role: string
  company: string
  companyUrl: string
  socialLinks: {
    twitter?: string
    linkedin?: string
    github?: string
  }
}

export const SHELDON_NIU: Author = {
  name: 'Sheldon Niu',
  slug: 'sheldon-niu',
  avatar: '/founder_avatar.png',
  bio: 'Founder of GeoWatch. Passionate about helping brands optimize their visibility in AI-powered search engines. Previously built developer tools and open-source projects.',
  role: 'Founder',
  company: 'GeoWatch',
  companyUrl: 'https://geowatch.ai',
  socialLinks: {
    twitter: 'https://x.com/NiuSheldon',
    linkedin: 'https://www.linkedin.com/in/dai-niu-754612382',
  },
}

const GEOWATCH_TEAM: Author = {
  name: 'GeoWatch Team',
  slug: 'geowatch-team',
  avatar: '/logo.svg',
  bio: 'The GeoWatch team helps brands track and optimize their visibility across AI search engines like ChatGPT, Perplexity, and Google AI Overviews.',
  role: 'AI Search Visibility Experts',
  company: 'GeoWatch',
  companyUrl: 'https://geowatch.ai',
  socialLinks: {
    twitter: 'https://x.com/NiuSheldon',
  },
}

export const AUTHORS: Record<string, Author> = {
  'sheldon-niu': SHELDON_NIU,
  'geowatch-team': GEOWATCH_TEAM,
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return AUTHORS[slug]
}

export function getAuthorByName(name: string): Author | undefined {
  const normalizedName = name.toLowerCase().trim()
  for (const author of Object.values(AUTHORS)) {
    if (author.name.toLowerCase() === normalizedName) return author
  }
  for (const author of Object.values(AUTHORS)) {
    if (
      author.name.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(author.name.toLowerCase())
    )
      return author
  }
  return undefined
}

export function getDefaultAuthor(): Author {
  return SHELDON_NIU
}

export function getAuthorUrl(author: Author): string {
  return `https://geowatch.ai/author/${author.slug}`
}

export function generateAuthorJsonLd(author: Author) {
  const baseUrl = 'https://geowatch.ai'
  const sameAs: string[] = []
  if (author.socialLinks.twitter) sameAs.push(author.socialLinks.twitter)
  if (author.socialLinks.linkedin) sameAs.push(author.socialLinks.linkedin)
  if (author.socialLinks.github) sameAs.push(author.socialLinks.github)

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/author/${author.slug}#person`,
    name: author.name,
    url: `${baseUrl}/author/${author.slug}`,
    image: {
      '@type': 'ImageObject',
      url: `${baseUrl}${author.avatar}`,
      width: 200,
      height: 200,
    },
    description: author.bio,
    jobTitle: author.role,
    worksFor: {
      '@type': 'Organization',
      name: author.company,
      url: author.companyUrl,
    },
    sameAs,
  }
}
