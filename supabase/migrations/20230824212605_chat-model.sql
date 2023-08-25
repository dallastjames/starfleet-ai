create type public.chat_model as enum (
  'gpt-3.5',
  'gpt-4'
);

alter table chat add column chat_model public.chat_model not null default 'gpt-3.5'::public.chat_model;