begin;
  -- This is the first query that uses supabase_realtime, so we should take control of it totally here
  -- remove the supabase_realtime publication
  drop publication if exists supabase_realtime;
  -- re-create the supabase_realtime publication with no tables
  create publication supabase_realtime;
commit;

create type public.author_type as enum (
  'human',
  'ai'
);

create table chat (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete cascade not null default auth.uid(),
  name text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now()
);

alter table chat enable row level security;

create policy "Enable read access for owning user" on "public"."chat"
as permissive for select
to authenticated
using (user_id = auth.uid());

create policy "Enable insert for owning user" on "public"."chat"
as permissive for insert
to authenticated
with check (user_id = auth.uid());

create policy "Enable delete for owning user" on "public"."chat"
as permissive for delete
to authenticated
using (user_id = auth.uid());

create function user_in_chat(_chat_id uuid)
returns boolean as $$
  select exists(select 1 from chat where id = _chat_id and user_id = auth.uid());
$$ language sql stable security definer;

create table chat_message (
  id uuid primary key default uuid_generate_v4(),
  chat_id uuid references chat (id) on delete cascade not null,
  message_text text not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  created_by public.author_type not null default 'human'::public.author_type
);

alter table chat_message enable row level security;
alter publication supabase_realtime add table chat_message;
alter table chat_message replica identity full;

create policy "Enable read access for owning user" on "public"."chat_message"
as permissive for select
to authenticated
using (user_in_chat(chat_id));

create policy "Enable insert for owning user" on "public"."chat_message"
as permissive for insert
to authenticated
with check (user_in_chat(chat_id) and created_by = 'human'::public.author_type);

create function update_chat_updated_at_date()
returns trigger as $$
  begin
    update chat set updated_at = now() where id = new.chat_id;
    return new;
  end;
$$ language plpgsql security definer;

create trigger update_chat_updated_at_date_on_new_message
after insert on chat_message
for each row execute procedure update_chat_updated_at_date();