alter table query_log add column if not exists retrieval_mode text default 'keyword';
alter table query_log add column if not exists latency_ms integer;
alter table query_log add column if not exists cited_card_ids uuid[] default '{}';
