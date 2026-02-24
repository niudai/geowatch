import type { BlogPostMetadata } from './blog'
import { getAuthorByName, getDefaultAuthor, getAuthorUrl } from './author'

export interface FAQItem {
  question: string
  answer: string
}

export interface HowToStep {
  name: string
  text: string
  position?: number
}

export interface JsonLdConfig {
  faq?: FAQItem[]
  howTo?: {
    name: string
    steps: HowToStep[]
  }
  product?: boolean
}

const BASE_URL = 'https://geowatch.ai'

export function generateBlogPostingJsonLd(
  metadata: BlogPostMetadata,
  slug: string
) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toISOString()
    } catch {
      return new Date().toISOString()
    }
  }

  const authorName = metadata.author || 'Sheldon Niu'
  const author = getAuthorByName(authorName) || getDefaultAuthor()

  const authorSameAs: string[] = []
  if (author.socialLinks.twitter) authorSameAs.push(author.socialLinks.twitter)
  if (author.socialLinks.linkedin) authorSameAs.push(author.socialLinks.linkedin)
  if (author.socialLinks.github) authorSameAs.push(author.socialLinks.github)

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: metadata.title,
    description: metadata.description,
    image: metadata.image || `${BASE_URL}/og-image.png`,
    datePublished: formatDate(metadata.date),
    dateModified: formatDate(metadata.date),
    author: {
      '@type': 'Person',
      '@id': `${BASE_URL}/author/${author.slug}#person`,
      name: author.name,
      url: getAuthorUrl(author),
      image: {
        '@type': 'ImageObject',
        url: `${BASE_URL}${author.avatar}`,
        width: 200,
        height: 200,
      },
      jobTitle: author.role,
      worksFor: {
        '@type': 'Organization',
        name: author.company,
        url: author.companyUrl,
      },
      sameAs: authorSameAs,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GeoWatch',
      url: BASE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/blog/${slug}`,
    },
    keywords: metadata.tags?.join(', ') || '',
    articleSection: 'GEO Optimization',
    inLanguage: 'en-US',
  }
}

export function generateFAQPageJsonLd(faqItems: FAQItem[]) {
  if (!faqItems || faqItems.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function generateHowToJsonLd(
  name: string,
  description: string,
  steps: HowToStep[]
) {
  if (!steps || steps.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      position: index + 1,
    })),
  }
}

export function generateProductJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'GeoWatch - AI Search Visibility Monitoring',
    alternateName: 'GeoWatch.ai',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    description:
      'Track your brand visibility across ChatGPT, Perplexity, Google AI Overviews, and every major AI search engine. The affordable Profound alternative for GEO monitoring.',
    url: BASE_URL,
    offers: {
      '@type': 'Offer',
      price: '49',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      description: 'Pro plan starting at $49/month',
    },
    keywords:
      'geo monitoring tool, ai search visibility, profound alternative, aeo tool, generative engine optimization, brand monitoring ai',
    featureList: [
      'Track brand mentions across ChatGPT, Perplexity, and Google AI Overviews',
      'Monitor competitor visibility in AI search results',
      'Real-time alerts when your brand appears in AI answers',
      'Citation tracking and source analysis',
      'Historical visibility trends and analytics',
      'Multi-engine coverage with a single dashboard',
    ],
  }
}

export function generateBreadcrumbJsonLd(slug: string, title: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${BASE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${BASE_URL}/blog/${slug}`,
      },
    ],
  }
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GeoWatch',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.svg`,
    },
    description:
      'AI search visibility monitoring platform helping brands track and optimize their presence in ChatGPT, Perplexity, and Google AI Overviews.',
  }
}

export function generateAllJsonLd(
  metadata: BlogPostMetadata & { jsonLd?: JsonLdConfig },
  slug: string
) {
  const jsonLdScripts: Record<string, unknown> = {}

  jsonLdScripts.blogPosting = generateBlogPostingJsonLd(metadata, slug)

  if (metadata.jsonLd?.faq) {
    jsonLdScripts.faqPage = generateFAQPageJsonLd(metadata.jsonLd.faq)
  }

  if (metadata.jsonLd?.howTo) {
    jsonLdScripts.howTo = generateHowToJsonLd(
      metadata.jsonLd.howTo.name,
      metadata.description,
      metadata.jsonLd.howTo.steps
    )
  }

  if (metadata.jsonLd?.product) {
    jsonLdScripts.product = generateProductJsonLd()
  }

  jsonLdScripts.breadcrumb = generateBreadcrumbJsonLd(slug, metadata.title)

  return jsonLdScripts
}
