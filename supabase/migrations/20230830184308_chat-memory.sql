alter table chat add column memory_summary text not null default '';

create extension vector;

create table chat_memory (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(1536)
);

create function match_memory(
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (chat_memory.embedding <=> query_embedding) as similarity
  from chat_memory
  where metadata @> filter
  order by chat_memory.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- We only access this table using the admin client, so we just entirely lock it down
alter table chat_memory enable row level security;