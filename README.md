# BrandBrain

BrandBrain is a living Company Brain for marketing agencies.
It ingests campaign history, answers team questions with citations, and scores new copy using Ogilvy-style principles grounded in the agency's own best work.

## What it does

- Ingests campaigns, briefs, brand guides, and performance notes
- Extracts structured knowledge cards from source documents
- Answers questions with citations from the agency's memory
- Scores copy from 0 to 100 and rewrites it for improvement
- Tracks costs and analytics in INR for visible usage accounting

## Stack

- Next.js 14 App Router
- Tailwind CSS
- Supabase Auth + PostgreSQL
- OpenAI gpt-4o-mini
- Recharts
- Sonner
- Lucide React

## Hackathon Context

This project was built for the OpenAI x Outskill AI Builders Hackathon.

### Event summary

- 7-day online AI builders hackathon in partnership with OpenAI
- Focused on shipping real AI products using Codex by OpenAI in under 7 days
- Participants were shortlisted from builder profiles, LinkedIn, GitHub, projects, and proof of work
- Timeline:
  - Monday, 26 May: Hackathon kickoff
  - Wednesday, 28 May: Product brief + MVP submission
  - Friday, 30 May: Final "Go Live" product version

### Who it was for

- Developers
- AI engineers
- Product builders
- Students
- Hackers shipping side projects
- Anyone building with AI tools and agents

### Why this exists

BrandBrain is designed to help agencies preserve institutional knowledge, improve creative judgment, and make their best work reusable across teams.

## Local setup

1. Copy `.env.local.example` to `.env.local`
2. Fill in Supabase and OpenAI environment variables
3. Apply the SQL migration in `supabase/migrations/001_initial.sql`
4. Run `npm install`
5. Run `npm run dev`

## License

Private hackathon project.
