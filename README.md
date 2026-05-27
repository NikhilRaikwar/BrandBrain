# 🧠 BrandBrain

> **Living Company Brain for marketing agencies.**  
> Ingest campaigns → Extract knowledge → Score copy → Share intelligence.

[![Built for OpenAI × Outskill Hackathon](https://img.shields.io/badge/OpenAI%20%C3%97%20Outskill-Hackathon%202026-green?style=flat-square)](https://outskill.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat-square)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat-square)](https://openai.com)

---

## What is BrandBrain?

Most agencies lose 40% of their institutional knowledge every time a senior hire leaves. BrandBrain makes that knowledge permanent — ingesting your campaigns, briefs, and brand guides, then scoring every new piece of copy against your own best work using David Ogilvy's 15 advertising principles.

---

## Architecture Overview

```mermaid
graph TD
    A[👤 User / Agency] --> B[BrandBrain App]
    B --> C{Core Layers}
    C --> D[🗄️ Knowledge Layer<br/>Ingest Documents]
    C --> E[⚖️ Judgment Layer<br/>Ogilvy Scorer]
    C --> F[🔧 Skills Layer<br/>Query Brain]

    D --> G[(Supabase PostgreSQL)]
    G --> H[raw_sources]
    G --> I[knowledge_cards]
    G --> J[query_log]
    G --> K[score_log]

    E --> L[GPT-4o-mini]
    F --> L

    B --> M[🔗 Public Share Link]
    M --> N[Read-only Brain Access]

    style A fill:#1a6b3c,color:#fff
    style L fill:#412991,color:#fff
    style G fill:#3ECF8E,color:#000
```

---

## User Flow

```mermaid
flowchart LR
    S([Start]) --> AU[Sign Up / Login]
    AU --> DB[Dashboard]

    DB --> IN[📥 Ingest Doc]
    DB --> QU[💬 Query Brain]
    DB --> SC[⚡ Score Copy]
    DB --> SH[🔗 Share Brain]
    DB --> AN[📊 Analytics]

    IN --> |Paste campaign / brief / brand guide| EX[GPT extracts 3-7 knowledge cards]
    EX --> KC[(knowledge_cards)]
    KC --> QU

    QU --> |Natural language question| KS[Keyword search over cards]
    KS --> GPT[GPT answers with citations]
    GPT --> RS[Response + source titles]

    SC --> |Paste new copy + pick client| OG[Ogilvy 15-principle scoring]
    OG --> BR[Breakdown + Top 3 failures]
    BR --> RW[AI Rewrite → scored again]

    SH --> |Toggle public ON| PL[Public share URL /b/token]
    PL --> |Anyone with link| QB[Query Brain — read only]

    style S fill:#d4541a,color:#fff
    style EX fill:#1a5a8c,color:#fff
    style GPT fill:#412991,color:#fff
    style OG fill:#1a6b3c,color:#fff
```

---

## Database Schema

```mermaid
erDiagram
    BRAINS {
        uuid id PK
        uuid user_id FK
        text name
        text description
        int docs_ingested
        int concepts_extracted
        int queries_answered
        text share_token
        bool is_public
        timestamptz created_at
    }

    RAW_SOURCES {
        uuid id PK
        uuid brain_id FK
        text title
        text content
        text source_type
        text client_name
        timestamptz created_at
    }

    KNOWLEDGE_CARDS {
        uuid id PK
        uuid brain_id FK
        uuid source_id FK
        text concept
        text summary
        text client_name
        text[] tags
        timestamptz created_at
    }

    QUERY_LOG {
        uuid id PK
        uuid brain_id FK
        text question
        text answer
        text[] sources_used
        int tokens_used
        float cost_usd
        timestamptz created_at
    }

    SCORE_LOG {
        uuid id PK
        uuid brain_id FK
        text client_name
        text original_copy
        int score_before
        int score_after
        jsonb breakdown
        jsonb top_3_failures
        text rewritten_copy
        float cost_usd
        timestamptz created_at
    }

    BRAINS ||--o{ RAW_SOURCES : "has"
    BRAINS ||--o{ KNOWLEDGE_CARDS : "has"
    BRAINS ||--o{ QUERY_LOG : "logs"
    BRAINS ||--o{ SCORE_LOG : "tracks"
    RAW_SOURCES ||--o{ KNOWLEDGE_CARDS : "generates"
```

---

## Multi-Brain & Sharing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as BrandBrain
    participant DB as Supabase
    participant AI as GPT-4o-mini
    participant P as Public User

    Note over U,P: Create & Populate Brain
    U->>App: Sign up → auto-creates Brain #1
    U->>App: Ingest document (client: Nike)
    App->>AI: Extract 3-7 concepts
    AI-->>App: JSON knowledge cards
    App->>DB: Save raw_source + knowledge_cards

    Note over U,P: Create Second Brain
    U->>App: Ingest doc for new client (Adidas)
    App->>DB: Creates Brain #2 automatically

    Note over U,P: Query Any Brain
    U->>App: Select Brain #1 (Nike), ask question
    App->>DB: Fetch knowledge_cards for Brain #1
    App->>AI: Build context + answer
    AI-->>App: Answer with citations
    App-->>U: Response showing source documents

    Note over U,P: Share Brain
    U->>App: Toggle Brain #1 public = true
    App->>DB: SET is_public = true
    App-->>U: Share URL → /b/abc123token

    P->>App: Visit /b/abc123token
    App->>DB: Fetch brain by share_token WHERE is_public=true
    App-->>P: Public query console (read-only)
    P->>App: Ask question
    App->>AI: Answer from Brain #1 cards
    AI-->>P: Response with citations
```

---

## Ogilvy Scoring Flow

```mermaid
flowchart TD
    A[User pastes copy] --> B{Brain has client history?}
    B -- No --> C[❌ Error: Ingest first]
    B -- Yes --> D[Fetch client knowledge_cards]

    D --> E[Build context from cards]
    E --> F[GPT scores against 15 principles]

    F --> G[Score breakdown table]
    G --> H[Top 3 failures with fixes]
    H --> I[AI rewrites copy]
    I --> J[Score the rewrite again]

    J --> K{Improvement?}
    K -- Yes ✅ --> L[Show: Before → After score]
    K -- No ⚠️ --> L

    L --> M[Save to score_log]
    M --> N[User can:\nCopy rewrite\nSave to Brain\nScore again]

    style F fill:#412991,color:#fff
    style L fill:#1a6b3c,color:#fff
    style C fill:#c0391a,color:#fff
```

---

## Three-Layer Company Brain Model

```mermaid
mindmap
  root((🧠 BrandBrain))
    Knowledge Layer
      Campaigns
        Headlines that worked
        CTR winners
        Seasonal patterns
      Brand Guides
        Voice and tone
        Never-do rules
        Visual language
      Briefs
        Target audience
        KPIs
        Budget signals
      Performance Data
        CAC benchmarks
        Conversion rates
        Channel mix
    Judgment Layer
      Ogilvy 15 Principles
        Product Positioning
        Unique Benefit
        Headline Quality
        Reader Focus
        Clear Tone
        Simple Language
        Evidence
        Emotion / Story
        Structure
        Call to Action
        Visuals
        Testability
        Length
        Attention Hook
        Repetition
    Skills Layer
      Query Brain
        Citation-backed answers
        Keyword matching
        Context building
      Score and Rewrite
        Principle breakdown
        Failure diagnosis
        AI rewrite
      Share Brain
        Public read-only link
        Token-based access
        Multi-user queries
```

---

## Tech Stack

```mermaid
graph LR
    FE[Next.js 14 App Router<br/>Tailwind CSS<br/>Recharts] --> API[API Routes<br/>/api/ingest<br/>/api/query<br/>/api/score]
    API --> OAI[OpenAI GPT-4o-mini]
    API --> SB[(Supabase<br/>Auth + PostgreSQL<br/>Row Level Security)]
    FE --> SB

    style FE fill:#000,color:#fff
    style OAI fill:#412991,color:#fff
    style SB fill:#3ECF8E,color:#000
```

---

## Features

### 🗄️ Knowledge Layer — Ingest
- Paste campaigns, briefs, brand guides, or performance data
- GPT-4o-mini extracts **3–7 structured knowledge cards** per document
- Each card: concept + summary + tags + client name
- Multiple brains per user — one per client or project

### ⚖️ Judgment Layer — Ogilvy Copy Scoring
- Score any copy **0–100** using David Ogilvy's 15 advertising principles
- Benchmarked against your **own client's past winning campaigns**
- Get a detailed breakdown, top 3 failure diagnoses, and an AI rewrite
- Before vs After score tracked in analytics

### 🔧 Skills Layer — Query Brain
- Ask anything in plain English
- Answers cite the **exact documents** they came from
- No hallucinations — only your agency's knowledge
- Works across multiple brains with the brain selector

### 🔗 Public Brain Sharing
- Toggle any brain public with one click
- Anyone with the `/b/{token}` URL can query — no login required
- Read-only access, no data modification possible
- Share with clients, new hires, or the world

### 📊 Analytics
- Copy quality over time (before vs after scores)
- Queries per day (last 7 days)
- Total docs, concepts, queries, scores

---

## Local Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd brandbrain
npm install

# 2. Environment variables
cp .env.local.example .env.local
# Fill in:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# OPENAI_API_KEY=

# 3. Database
# Run supabase/migrations/001_initial.sql in your Supabase SQL editor
# Then run 002 and 003

# 4. Run
npm run dev
```

---

## API Reference

### POST /api/ingest
```json
{
  "brainId": "uuid (optional — creates one if missing)",
  "sourceType": "campaign | brand_guide | brief | performance_data",
  "clientName": "Nike",
  "title": "Summer 2026 Campaign",
  "content": "Full document text..."
}
```
Returns: `{ brain_id, concepts: [...], count, cost_usd }`

### POST /api/query
```json
{
  "brainId": "uuid",
  "question": "What tone works best for youth FMCG?",
  "shareToken": "optional — for public brain access"
}
```
Returns: `{ answer, sources: ["Doc title 1", ...], cost_usd }`

### POST /api/score
```json
{
  "brainId": "uuid",
  "clientName": "Nike",
  "copy": "Your copy to score here..."
}
```
Returns: `{ overall_score, breakdown, top_3_failures, rewrite, rewrite_score, cost_usd }`

---

## Hackathon Context

**OpenAI × Outskill AI Builders Hackathon — May 2026**

| Milestone | Date | Status |
|-----------|------|--------|
| Kickoff | Mon 26 May | ✅ Done |
| Product brief + MVP | Wed 28 May | ✅ Submitting |
| Final Go Live | Fri 30 May | 🚀 In progress |

**Built for:** Developers, AI engineers, product builders, and agencies who want their institutional knowledge to survive every team change.

---

## License

Private hackathon project — BrandBrain © 2026
