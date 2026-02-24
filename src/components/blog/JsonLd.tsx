import React from 'react'

interface JsonLdProps {
  data: Record<string, unknown>
}

type SchemaObject = Record<string, unknown>

function createSchemaSignature(schema: SchemaObject, fallbackKey: string) {
  if (typeof schema !== 'object' || schema === null) return fallbackKey
  const identifier =
    (typeof schema['@id'] === 'string' && schema['@id']) ||
    (typeof schema['@type'] === 'string' && schema['@type'])
  if (!identifier) return fallbackKey
  return identifier
}

function serializeSchemas(schemas: SchemaObject[]) {
  if (schemas.length === 0) return ''
  if (schemas.length === 1) return JSON.stringify(schemas[0])
  return JSON.stringify(schemas)
}

export function JsonLd({ data }: JsonLdProps) {
  const seen = new Set<string>()
  const uniqueSchemas: SchemaObject[] = []

  Object.entries(data).forEach(([key, schema]) => {
    if (!schema || typeof schema !== 'object') return
    const signature = createSchemaSignature(schema as SchemaObject, key)
    if (seen.has(signature)) return
    seen.add(signature)
    uniqueSchemas.push(schema as SchemaObject)
  })

  const serialized = serializeSchemas(uniqueSchemas)
  if (!serialized) return null

  return (
    <script
      id="jsonld-structured-data"
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  )
}

export function JsonLdScript({ data }: { data: unknown }) {
  if (!data || typeof data !== 'object') return null
  const serialized = serializeSchemas([data as SchemaObject])
  if (!serialized) return null

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  )
}
