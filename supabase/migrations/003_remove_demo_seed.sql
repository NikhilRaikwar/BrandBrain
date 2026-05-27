create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.brains (user_id, name)
  values (new.id, 'My Agency Brain');

  return new;
end;
$$;

delete from public.raw_sources
where client_name = 'ZestAds'
  and title in (
    'ZestAds Brand Guide',
    'Noise Pro 5 Launch Campaign',
    'Q3 Digital Brief - Colorway Launch',
    'Q3 Digital Brief — Colorway Launch'
  );

update public.brains b
set
  docs_ingested = coalesce((select count(*) from public.raw_sources rs where rs.brain_id = b.id), 0),
  concepts_extracted = coalesce((select count(*) from public.knowledge_cards kc where kc.brain_id = b.id), 0),
  queries_answered = coalesce((select count(*) from public.query_log q where q.brain_id = b.id), 0)
where true;
