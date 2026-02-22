# GeoWatch Real-Time Monitoring System

## Overview

GeoWatch now has a complete real-time monitoring system that tracks brand mentions across:
- **Google AI Mode** (via Oxylabs API)
- **ChatGPT** (via Geelark browser automation)

## System Architecture

### Core Components

#### 1. Monitoring Library (`src/lib/monitoring.ts`)
- `queryGoogleAIMode(query: string)` - Queries Google AI Mode and extracts:
  - AI response text
  - Citations (sources)
  - Links
  - Mention detection

- `queryChatGPT(query: string)` - Queries ChatGPT via WebSocket:
  - Uses Geelark browser automation API
  - Navigates to chatgpt.com
  - Enters query and captures response
  - Handles session management

- `generateQueries(keyword: string)` - Creates variant queries:
  - "what is {keyword}"
  - "{keyword} vs alternatives"
  - "{keyword} features and benefits"
  - "best {keyword}"
  - "{keyword} reviews"

- `detectMention(response: string, brandName: string)` - Detects brand mentions:
  - Case-insensitive substring matching
  - Returns context (100 chars before/after)

#### 2. Database Schema (`src/lib/schema.ts`)

**Apps Table:**
- `id` - UUID primary key
- `userId` - Foreign key to user
- `name` - App name (e.g., "My SaaS")
- `slug` - URL-friendly identifier
- `description` - App description
- `status` - 'active', 'paused', 'archived'
- `createdAt`, `updatedAt`

**Keywords Table:**
- `id` - UUID primary key
- `appId` - Foreign key to app
- `keyword` - Search term to monitor (e.g., "GeoWatch")
- `status` - 'active', 'paused'
- `lastCheckedAt` - Last monitoring run timestamp
- `createdAt`

**Monitoring Results Table:**
- `id` - UUID primary key
- `appId` - Foreign key to app
- `keywordId` - Foreign key to keyword
- `source` - 'google_ai_mode' or 'chatgpt'
- `queryText` - The query that was searched
- `aiResponse` - Full AI response text
- `mentionedInResponse` - Boolean
- `sentiment` - 'positive', 'negative', 'neutral'
- `citations` - JSON array of {text, urls}
- `links` - JSON array of {text, url}
- `mentionText` - Extracted mention context
- `createdAt`

**Monitoring Tasks Table:**
- `id` - UUID primary key
- `appId`, `keywordId` - Foreign keys
- `source` - API source
- `status` - 'pending', 'running', 'completed', 'failed'
- `scheduledAt`, `startedAt`, `completedAt`, `nextRunAt`
- `errorMessage` - If failed

#### 3. API Endpoints

**Apps Management:**
- `GET /api/apps` - List user's apps
- `POST /api/apps` - Create new app

**Keywords Management:**
- `GET /api/apps/[appId]/keywords` - List keywords for app
- `POST /api/apps/[appId]/keywords` - Add keyword to app

**Monitoring:**
- `POST /api/apps/[appId]/run-monitoring` - Trigger monitoring for all keywords
  - Generates 5 queries per keyword
  - Runs both Google AI Mode and ChatGPT
  - Detects mentions
  - Stores results in database
  - Updates lastCheckedAt timestamp

**Results:**
- `GET /api/apps/[appId]/results` - Get last 50 monitoring results

#### 4. Frontend Pages

**Dashboard Page (`/dashboard`):**
- Lists all user's apps in a grid
- Create new app form
- Click app to navigate to detail page

**App Detail Page (`/dashboard/[appId]`):**
- App information header
- Run Monitoring button
- Keywords section with add keyword form
- Recent Results section showing:
  - Source (Google AI Mode or ChatGPT)
  - Query text
  - Mentioned status (✓ or ✗)
  - Sentiment badge
  - AI response preview (500 chars)
  - Mention context (if mentioned)

## Configuration

### Environment Variables Required

```
# Database
DATABASE_URL=postgresql://...

# Oxylabs (Google AI Mode)
OXYLABS_USERNAME=...
OXYLABS_PASSWORD=...

# Geelark (ChatGPT Browser Automation)
GEELARK_BEARER_TOKEN=...

# NextAuth
AUTH_SECRET=...
NEXTAUTH_URL=https://geowatch.ai
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

## How It Works

### Monitoring Flow

1. User logs in to dashboard
2. Creates an "App" (e.g., "My SaaS")
3. Adds keywords to monitor (e.g., "My SaaS", "AI SEO Platform")
4. Clicks "Run Monitoring"
5. System generates queries for each keyword:
   - 5 query variants per keyword
   - Total: 2 sources × 5 queries × N keywords = results
6. Results are stored with:
   - Whether brand was mentioned
   - Exact mention context
   - Full AI response
   - Source (Google AI Mode or ChatGPT)
7. User views results in dashboard:
   - Can see mention status
   - Can see context of mentions
   - Can track sentiment over time

### Example Monitoring Run

User adds keyword "GeoWatch" to their app:

**Queries Generated:**
1. "what is geowatch"
2. "geowatch vs alternatives"
3. "geowatch features and benefits"
4. "best geowatch"
5. "geowatch reviews"

**For Each Query, System Runs:**
1. Google AI Mode query via Oxylabs
2. ChatGPT query via Geelark

**Results Stored:**
```
{
  source: "google_ai_mode",
  queryText: "what is geowatch",
  mentionedInResponse: true,
  mentionText: "GeoWatch is a platform for monitoring brand mentions...",
  sentiment: "positive",
  aiResponse: "...[full response]..."
}
```

## Features Implemented

✅ **Authentication**
- NextAuth v5 with Google OAuth
- User sessions stored in Neon PostgreSQL

✅ **App Management**
- Create apps/brands to monitor
- Associate keywords with each app
- Track last check timestamp

✅ **Keyword Management**
- Add/remove keywords to monitor
- Mark keywords as active/paused
- View monitoring history per keyword

✅ **Google AI Mode Integration**
- Query via Oxylabs API
- Extract response text, citations, links
- Detect brand mentions in responses

✅ **ChatGPT Integration**
- Browser automation via Geelark
- Navigate to ChatGPT
- Enter query and capture response
- Profile reuse for efficiency

✅ **Mention Detection**
- Case-insensitive brand name matching
- Extract context (100 chars before/after)
- Return mention snippets

✅ **Results Storage & Retrieval**
- Store all monitoring results in database
- Retrieve last 50 results per app
- Track source and sentiment

✅ **Dashboard UI**
- Protected pages with authentication
- App listing and creation
- App detail with keywords and results
- Real-time results display

## Testing

### System Validation
```bash
./validate-system.sh
```

Checks:
- ✓ Dev server running
- ✓ API authentication
- ✓ Monitoring functions
- ✓ API endpoints
- ✓ Database connectivity
- ✓ Environment variables

### Manual Testing Flow

1. Start dev server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Sign in with Google
4. Create an app
5. Add keywords
6. Click "Run Monitoring"
7. Wait for results to appear
8. View results in dashboard

## Performance Considerations

- **Oxylabs API**: ~2-5 seconds per query
- **Geelark ChatGPT**: ~8-10 seconds per query
- **Query Generation**: 5 variants per keyword
- **Total Time**: ~1-2 minutes for 10 keywords across 2 sources

## Future Enhancements

- [ ] Scheduled monitoring (cron jobs every 4 hours)
- [ ] Sentiment analysis via Claude API
- [ ] Competitor analysis comparison
- [ ] Email alerts via Resend
- [ ] Real-time WebSocket updates
- [ ] Advanced filtering and sorting
- [ ] Export results to CSV/PDF
- [ ] Historical trends and analytics dashboard
- [ ] API rate limiting and throttling
- [ ] Webhook integrations (Slack, Discord)

## Error Handling

All monitoring operations include:
- Try-catch blocks with detailed logging
- Database transaction rollback on failure
- Graceful degradation (continue on partial failures)
- Error messages stored in monitoringTasks
- API endpoints return 401 for auth failures, 403 for permission errors

## Security

- All API endpoints require authentication
- User ownership verified before accessing apps/keywords
- Foreign key constraints prevent data leakage
- Environment variables for sensitive credentials
- NextAuth session management
- CSRF protection via NextAuth

## Deployment

Ready to deploy to Vercel:
```bash
git push origin main
```

Vercel will automatically:
1. Build the Next.js application
2. Deploy to production
3. Apply database migrations
4. Set environment variables from Vercel dashboard

## Database Migrations

Migrations are stored in `drizzle/` directory:
- Auto-generated via `drizzle-kit`
- Pushed to database via `pnpm db:push`
- Track schema changes over time
