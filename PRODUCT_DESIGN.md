# GeoWatch Product Design v2.0
## Real-Time AI Mention Monitoring Platform

---

## Product Vision

**Core**: Monitor your brand mentions in real-time across Google AI Mode and ChatGPT (and other AI engines).
**User Journey**: Login → Create App → Add Keywords → Monitor in Real-time Dashboard

---

## Core Entities & Data Model

### 1. User
- `id` UUID (PK)
- `email` string (unique)
- `name` string
- `avatar_url` string (nullable)
- `created_at` timestamp
- `updated_at` timestamp

### 2. App (Per-Brand/Project)
- `id` UUID (PK)
- `user_id` UUID (FK)
- `name` string (e.g., "My SaaS", "Product X")
- `slug` string (unique per user, for URL)
- `description` string (optional)
- `logo_url` string (optional)
- `status` enum: 'active' | 'paused' | 'archived'
- `created_at` timestamp
- `updated_at` timestamp

### 3. Keyword
- `id` UUID (PK)
- `app_id` UUID (FK)
- `keyword` string (e.g., "my product name", "my brand")
- `status` enum: 'active' | 'paused'
- `last_checked_at` timestamp (nullable)
- `created_at` timestamp

### 4. Monitoring Result
- `id` UUID (PK)
- `app_id` UUID (FK)
- `keyword_id` UUID (FK)
- `source` enum: 'google_ai_mode' | 'chatgpt'
- `query_text` string (the query that triggered the result)
- `ai_response` text (the full AI response)
- `mentioned_in_response` boolean (did AI mention our brand?)
- `sentiment` enum: 'positive' | 'negative' | 'neutral' | 'not_mentioned'
- `citations` json[] (if mentioned, what sources cited us)
- `mention_text` text (the specific text where we were mentioned)
- `created_at` timestamp

### 5. Monitoring Task (for scheduling)
- `id` UUID (PK)
- `app_id` UUID (FK)
- `keyword_id` UUID (FK)
- `source` enum: 'google_ai_mode' | 'chatgpt'
- `status` enum: 'pending' | 'running' | 'completed' | 'failed'
- `scheduled_at` timestamp
- `started_at` timestamp (nullable)
- `completed_at` timestamp (nullable)
- `next_run_at` timestamp (nullable)
- `error_message` text (nullable)
- `created_at` timestamp

---

## User Workflows

### Workflow 1: New User Onboarding
1. User signs up with email (via Google OAuth or Email/Password)
2. System creates `User` record
3. Redirects to "/onboarding"
4. User creates first App (e.g., "My SaaS")
5. User adds Keywords (e.g., ["my saas", "my product", "brand name"])
6. System creates `MonitoringTask` records for each keyword × source
7. First monitoring run starts immediately
8. User sees real-time dashboard with results

### Workflow 2: Monitor Keywords
1. User in Dashboard → Sees all Apps
2. Clicks App → Sees Keywords + Latest Monitoring Results
3. Each keyword shows:
   - Last checked: timestamp
   - Latest status: mentioned / not mentioned
   - Sentiment: if mentioned
   - Citation count: how many times
   - Trending: 📈 (more mentions lately) / 📉 (fewer)
4. User can click result to see full details:
   - Full AI response
   - Where brand was mentioned
   - Citations/sources
   - Related results

### Workflow 3: Manage Keywords
1. App Dashboard → Keywords section
2. User can:
   - **Add Keyword**: Type new keyword, system starts monitoring
   - **Pause Keyword**: Stops monitoring this keyword
   - **Delete Keyword**: Stops + removes history
   - **Edit Keyword**: Update keyword text (creates new monitoring task)

### Workflow 4: View Analytics
1. App Dashboard → Analytics tab
2. Shows:
   - **Visibility Score**: X% of AI queries mention us (vs competitors)
   - **Mention Trend**: 📊 Last 7 days / 30 days
   - **Sentiment Breakdown**: Positive/Neutral/Negative mentions (pie chart)
   - **Top Sources**: Which AI engines mention us most
   - **Top Citing Sites**: Which websites are sources of our citations

---

## User Interface Structure

```
/dashboard
├── Sidebar
│   ├── Logo "GeoWatch"
│   ├── Apps List (user's apps)
│   │   ├── [App 1] - Active
│   │   ├── [App 2] - Active
│   │   └── + New App
│   ├── Settings
│   └── Logout

├── Main Content
│   ├── [If no apps]
│   │   └── Empty state + "Create First App" CTA
│   │
│   └── [If app selected]
│       ├── Header: App name + Stats
│       │   ├── 📊 Visibility Score: 87%
│       │   ├── 🎯 Keywords Tracked: 5
│       │   ├── ✨ Mentions Last 7d: 42
│       │
│       ├── Tabs
│       │   ├── Monitor (Default)
│       │   │   ├── Keywords List
│       │   │   │   ├── Keyword + Last checked + Status + Sentiment
│       │   │   │   ├── [Each keyword expandable to show results]
│       │   │   │   └── + Add Keyword
│       │   │   │
│       │   │   ├── Real-time Results Feed
│       │   │   │   └── [Latest mention: "Keyword X mentioned in ChatGPT for query Y"]
│       │   │   │       [Timestamp + Sentiment icon + View detail]
│       │   │
│       │   ├── Analytics
│       │   │   ├── Visibility Score Chart
│       │   │   ├── Mention Trend (7d/30d)
│       │   │   ├── Sentiment Breakdown
│       │   │   ├── Top AI Sources
│       │   │   └── Top Citing Sites
│       │   │
│       │   ├── Settings
│       │   │   ├── App name, logo
│       │   │   ├── Keywords management (bulk import/export)
│       │   │   ├── Monitoring frequency
│       │   │   └── Delete app
```

---

## Monitoring Strategy

### Google AI Mode Monitoring (via Oxylabs)
```
For each keyword:
  1. Generate 5 queries related to keyword (AI-powered query expansion)
     - "best [keyword]"
     - "[keyword] vs competitors"
     - "[keyword] use cases"
     - "[keyword] reviews"
     - "[keyword] features"

  2. Run each query through Google AI Mode (Oxylabs)

  3. Extract:
     - Full AI response text
     - Whether keyword appears in response
     - Where mentioned (position in text)
     - Citations (what sources did AI cite)

  4. Store result in MonitoringResult

  5. Schedule next run: every 24 hours
```

### ChatGPT Monitoring (via Geelark browser automation)
```
For each keyword:
  1. Generate same query set as Google AI Mode

  2. For each query:
     - Use Geelark to open ChatGPT (no login needed - free version)
     - Send query
     - Wait for response
     - Screenshot/extract response text
     - Extract citations

  3. Store result in MonitoringResult

  4. Schedule next run: every 24 hours

Note: Use proxy IP rotation (Geelark built-in) to avoid rate limiting
```

---

## Analytics Calculation

### Visibility Score
```
Visibility Score = (mentions_this_period / total_ai_queries) × 100

Example:
- We ran 50 keyword queries across Google AI Mode + ChatGPT (100 total)
- Our brand was mentioned in 30 responses
- Visibility Score = 30/100 × 100 = 30%

Per-source breakdown:
- Google AI Mode: 20 mentions / 50 queries = 40%
- ChatGPT: 10 mentions / 50 queries = 20%
```

### Sentiment Analysis
```
For each mention, determine:
- Positive: "highly recommended", "best solution", "top choice"
- Neutral: "is an option", "can be used for", "also offers"
- Negative: "has issues", "not suitable", "outdated"

Automated via Claude API + LLM classification
```

---

## Monitoring Frequency & Limits

### Free Plan (Future)
- Max 2 apps
- Max 5 keywords per app
- Monitoring: Daily (once per day)
- Analytics retention: 30 days

### Paid Plan (Future)
- Unlimited apps
- Unlimited keywords
- Monitoring: Every 4 hours (6x/day)
- Analytics retention: 1 year
- Advanced analytics (trending, competitor comparison)

### MVP (Now)
- Single app, unlimited keywords
- Manual trigger + scheduled (every 4 hours)
- Unlimited retention

---

## API Endpoints

```
AUTH:
POST /api/auth/login         - Email login
POST /api/auth/signup        - Email signup
GET  /api/auth/me            - Current user
POST /api/auth/logout        - Logout

APPS:
GET  /api/apps               - List user's apps
POST /api/apps               - Create new app
GET  /api/apps/:appId        - Get app details
PUT  /api/apps/:appId        - Update app
DEL  /api/apps/:appId        - Delete app (archive)

KEYWORDS:
GET  /api/apps/:appId/keywords           - List keywords
POST /api/apps/:appId/keywords           - Add keyword
PUT  /api/apps/:appId/keywords/:keywordId - Update
DEL  /api/apps/:appId/keywords/:keywordId - Delete

MONITORING:
GET  /api/apps/:appId/results            - Get monitoring results (paginated)
GET  /api/apps/:appId/results/:resultId  - Get result details
POST /api/apps/:appId/run-monitoring     - Manual trigger monitoring
GET  /api/apps/:appId/analytics          - Get analytics data

ADMIN:
POST /api/monitoring/start               - Start background monitoring job
GET  /api/monitoring/status              - Check monitoring job status
```

---

## Implementation Phases

### Phase 1 (MVP - This Sprint)
- [x] Database schema (Neon)
- [ ] User auth (Google OAuth + Next Auth v5)
- [ ] App CRUD
- [ ] Keyword CRUD
- [ ] Google AI Mode monitoring
- [ ] ChatGPT monitoring (Geelark)
- [ ] Basic monitoring result display
- [ ] Manual trigger monitoring
- [ ] E2E testing via browser

### Phase 2 (Polish)
- [ ] Analytics dashboard
- [ ] Real-time websocket updates
- [ ] Sentiment analysis
- [ ] Competitor comparison
- [ ] Email alerts
- [ ] Monitoring history/trends

### Phase 3 (Scale)
- [ ] Paid plans (Stripe)
- [ ] Advanced filters
- [ ] Bulk keyword import
- [ ] API access for users
- [ ] Custom integrations

---

## Success Metrics

- User can monitor 5 keywords across 2 sources within 5 minutes of signup
- Monitoring accuracy >95% (manual verification)
- Dashboard loads <2 seconds
- Results updated within 5 minutes of new monitoring run
- ChatGPT monitoring works without user login
