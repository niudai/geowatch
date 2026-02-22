import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  json,
  varchar,
  index,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

// ── NextAuth required tables ──────────────────────────────────────────────────

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
})

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// ── App tables ────────────────────────────────────────────────────────────────

export const waitlist = pgTable('waitlist', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  notified: boolean('notified').notNull().default(false),
})

// ── GeoWatch Monitoring Tables ─────────────────────────────────────────────────

export const apps = pgTable('app', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull(),
  description: text('description'),
  logoUrl: text('logoUrl'),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active | paused | archived
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
})

export const keywords = pgTable('keyword', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  appId: text('appId')
    .notNull()
    .references(() => apps.id, { onDelete: 'cascade' }),
  keyword: varchar('keyword', { length: 500 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'), // active | paused
  lastCheckedAt: timestamp('lastCheckedAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

export const monitoringResults = pgTable('monitoring_result', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  appId: text('appId')
    .notNull()
    .references(() => apps.id, { onDelete: 'cascade' }),
  keywordId: text('keywordId')
    .notNull()
    .references(() => keywords.id, { onDelete: 'cascade' }),
  source: varchar('source', { length: 50 }).notNull(), // google_ai_mode | chatgpt
  queryText: text('queryText').notNull(),
  aiResponse: text('aiResponse').notNull(),
  mentionedInResponse: boolean('mentionedInResponse').notNull().default(false),
  sentiment: varchar('sentiment', { length: 50 }), // positive | negative | neutral | not_mentioned
  citations: json('citations'), // Array of {text, urls}
  links: json('links'), // Array of {text, url}
  mentionText: text('mentionText'), // The specific text where brand was mentioned
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

export const monitoringTasks = pgTable('monitoring_task', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  appId: text('appId')
    .notNull()
    .references(() => apps.id, { onDelete: 'cascade' }),
  keywordId: text('keywordId')
    .notNull()
    .references(() => keywords.id, { onDelete: 'cascade' }),
  source: varchar('source', { length: 50 }).notNull(), // google_ai_mode | chatgpt
  status: varchar('status', { length: 50 }).notNull().default('pending'), // pending | running | completed | failed
  scheduledAt: timestamp('scheduledAt', { mode: 'date' }).notNull(),
  startedAt: timestamp('startedAt', { mode: 'date' }),
  completedAt: timestamp('completedAt', { mode: 'date' }),
  nextRunAt: timestamp('nextRunAt', { mode: 'date' }),
  errorMessage: text('errorMessage'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
})

