-- BRAINS TABLE
create table brains (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'My Agency Brain',
  description text default 'A living memory of how this agency thinks.',
  docs_ingested integer default 0,
  concepts_extracted integer default 0,
  queries_answered integer default 0,
  share_token text unique default 
    encode(gen_random_bytes(12), 'hex'),
  is_public boolean default false,
  created_at timestamptz default now()
);

-- RAW SOURCES TABLE
create table raw_sources (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid references brains(id) on delete cascade,
  title text not null,
  content text not null,
  source_type text check (source_type in 
    ('campaign','brand_guide','brief','performance_data')),
  client_name text not null,
  created_at timestamptz default now()
);

-- KNOWLEDGE CARDS TABLE
create table knowledge_cards (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid references brains(id) on delete cascade,
  source_id uuid references raw_sources(id) on delete cascade,
  concept text not null,
  summary text not null,
  client_name text not null,
  tags text[] default '{}',
  created_at timestamptz default now()
);

-- QUERY LOG TABLE
create table query_log (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid references brains(id) on delete cascade,
  question text not null,
  answer text not null,
  sources_used text[] default '{}',
  tokens_used integer default 0,
  cost_usd float default 0,
  created_at timestamptz default now()
);

-- SCORE LOG TABLE
create table score_log (
  id uuid primary key default gen_random_uuid(),
  brain_id uuid references brains(id) on delete cascade,
  client_name text not null,
  original_copy text not null,
  score_before integer not null,
  score_after integer not null,
  breakdown jsonb not null,
  top_3_failures jsonb not null,
  rewritten_copy text not null,
  tokens_used integer default 0,
  cost_usd float default 0,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table brains enable row level security;
alter table raw_sources enable row level security;
alter table knowledge_cards enable row level security;
alter table query_log enable row level security;
alter table score_log enable row level security;

-- POLICIES
create policy "owner_all" on brains
  for all using (auth.uid() = user_id);

create policy "public_read_brain" on brains
  for select using (is_public = true);

create policy "owner_all_sources" on raw_sources
  for all using (
    brain_id in (select id from brains where user_id = auth.uid())
  );

create policy "owner_all_cards" on knowledge_cards
  for all using (
    brain_id in (select id from brains where user_id = auth.uid())
  );

create policy "public_read_cards" on knowledge_cards
  for select using (
    brain_id in (select id from brains where is_public = true)
  );

create policy "owner_all_queries" on query_log
  for all using (
    brain_id in (select id from brains where user_id = auth.uid())
  );

create policy "owner_all_scores" on score_log
  for all using (
    brain_id in (select id from brains where user_id = auth.uid())
  );

-- AUTO-CREATE BRAIN ON SIGNUP TRIGGER
create or replace function handle_new_user()
returns trigger as $$
declare
  new_brain_id uuid;
begin
  insert into brains (user_id, name)
  values (new.id, 'My Agency Brain')
  returning id into new_brain_id;

  -- Seed ZestAds demo data
  insert into raw_sources (brain_id, title, content, 
    source_type, client_name)
  values
  (new_brain_id, 
   'ZestAds Brand Guide',
   'Brand voice: Young, bold, India-first. Never formal. Uses 
    urban slang. Client: Noise smartwatches. Target: 18-25 urban 
    youth. Tone: Confident, irreverent, culturally aware. 
    Never use: corporate speak, passive voice, feature lists. 
    Always use: direct address, action verbs, cultural references.',
   'brand_guide', 'ZestAds'),
  (new_brain_id,
   'Noise Pro 5 Launch Campaign',
   'Campaign: Wear the future. Noise Pro 5. Rs 4999. 
    Result: 2.3x CTR vs category average. Score: 88/100. 
    What worked: bold hero statement, price anchoring, 
    youth-coded visual language. Headline: Your wrist, 
    your rules. Body: Stop watching time. Start owning it.',
   'campaign', 'ZestAds'),
  (new_brain_id,
   'Q3 Digital Brief — Colorway Launch',
   'Objective: Launch limited edition colorways for monsoon 
    season. Target: Gen Z urban buyers in metro cities. 
    Budget: Rs 50L digital-first. KPIs: 10K units in 30 days, 
    CAC under Rs 800. Key message: Limited. Loud. Yours.',
   'brief', 'ZestAds');

  -- Create knowledge cards for demo data
  insert into knowledge_cards (brain_id, source_id, concept, 
    summary, client_name, tags)
  select 
    new_brain_id,
    rs.id,
    'ZestAds Brand Voice',
    'Young, bold, India-first tone. Never formal. Urban slang 
     for 18-25 buyers. Direct address always.',
    'ZestAds',
    array['brand-voice', 'tone', 'copywriting']
  from raw_sources rs 
  where rs.brain_id = new_brain_id 
    and rs.source_type = 'brand_guide'
  limit 1;

  -- Update brain stats
  update brains set 
    docs_ingested = 3, 
    concepts_extracted = 1
  where id = new_brain_id;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
