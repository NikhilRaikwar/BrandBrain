create extension if not exists vector;
alter table knowledge_cards add column if not exists embedding vector(1536);
create index if not exists knowledge_cards_embedding_idx
  on knowledge_cards using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create or replace function match_cards(p_brain_id uuid, p_embedding vector(1536), p_limit int default 20)
returns table (id uuid, concept text, summary text, client_name text, tags text[], source_id uuid, similarity float)
language sql stable as $$
  select id, concept, summary, client_name, tags, source_id,
         1 - (embedding <=> p_embedding) as similarity
  from knowledge_cards
  where brain_id = p_brain_id and embedding is not null
  order by embedding <=> p_embedding limit p_limit $$;
