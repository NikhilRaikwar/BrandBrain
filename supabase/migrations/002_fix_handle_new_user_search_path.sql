create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  new_brain_id uuid;
begin
  insert into public.brains (user_id, name)
  values (new.id, 'My Agency Brain')
  returning id into new_brain_id;

  insert into public.raw_sources (brain_id, title, content, source_type, client_name)
  values
  (
    new_brain_id,
    'ZestAds Brand Guide',
    'Brand voice: Young, bold, India-first. Never formal. Uses urban slang. Client: Noise smartwatches. Target: 18-25 urban youth. Tone: Confident, irreverent, culturally aware. Never use: corporate speak, passive voice, feature lists. Always use: direct address, action verbs, cultural references.',
    'brand_guide',
    'ZestAds'
  ),
  (
    new_brain_id,
    'Noise Pro 5 Launch Campaign',
    'Campaign: Wear the future. Noise Pro 5. Rs 4999. Result: 2.3x CTR vs category average. Score: 88/100. What worked: bold hero statement, price anchoring, youth-coded visual language. Headline: Your wrist, your rules. Body: Stop watching time. Start owning it.',
    'campaign',
    'ZestAds'
  ),
  (
    new_brain_id,
    'Q3 Digital Brief - Colorway Launch',
    'Objective: Launch limited edition colorways for monsoon season. Target: Gen Z urban buyers in metro cities. Budget: Rs 50L digital-first. KPIs: 10K units in 30 days, CAC under Rs 800. Key message: Limited. Loud. Yours.',
    'brief',
    'ZestAds'
  );

  insert into public.knowledge_cards (brain_id, source_id, concept, summary, client_name, tags)
  select
    new_brain_id,
    rs.id,
    'ZestAds Brand Voice',
    'Young, bold, India-first tone. Never formal. Urban slang for 18-25 buyers. Direct address always.',
    'ZestAds',
    array['brand-voice', 'tone', 'copywriting']
  from public.raw_sources rs
  where rs.brain_id = new_brain_id
    and rs.source_type = 'brand_guide'
  limit 1;

  update public.brains
  set
    docs_ingested = 3,
    concepts_extracted = 1
  where id = new_brain_id;

  return new;
end;
$$;
