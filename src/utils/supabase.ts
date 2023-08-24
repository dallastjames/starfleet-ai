import { createClient } from '@supabase/supabase-js';
import { Accessor, createResource, createSignal } from 'solid-js';
import { Database } from './database';

const [supabase] = createSignal(
  createClient<Database>(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY),
);

export type Table<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Enum<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

export function useSupabaseClient() {
  return supabase();
}

export function useUser() {
  return createResource(async () => {
    const { data, error } = await supabase().auth.getUser();
    if (error) return null;
    if (!data.user) return null;
    return data.user;
  });
}

export function useChatList() {
  return createResource(async () => {
    const { data, error } = await supabase().auth.getUser();
    if (error || !data?.user) return [];

    const { data: chatList, error: chatErrors } = await supabase()
      .from('chat')
      .select('*')
      .match({
        user_id: data.user.id,
      })
      .order('updated_at', { ascending: false });

    if (chatErrors || !chatList) return [];
    return chatList;
  });
}

export function useMessages(chat: Accessor<Table<'chat'> | null>) {
  return createResource(chat, async c => {
    if (!c) return [];
    const { data: messages, error } = await supabase()
      .from('chat_message')
      .select('*')
      .match({
        chat_id: c.id,
      })
      .order('created_at', { ascending: true });

    if (error || !messages) return [];
    return messages;
  });
}

export function realtimeChanges<
  TableName extends keyof Database['public']['Tables'],
  ReturnTable = Table<TableName>,
>(
  { table, filter }: { table: TableName; filter?: string },
  {
    onInsert: insertHandler,
    onUpdate: updateHandler,
    onDelete: deleteHandler,
  }: {
    onInsert?: (payload: ReturnTable) => void;
    onUpdate?: (payload: ReturnTable) => void;
    onDelete?: (payload: ReturnTable) => void;
  },
) {
  const hasInsert = !!insertHandler;
  const hasUpdate = !!updateHandler;
  const hasDelete = !!deleteHandler;

  const event = atLeastTwoTrue(hasInsert, hasUpdate, hasDelete)
    ? '*'
    : hasInsert
    ? 'INSERT'
    : hasUpdate
    ? 'UPDATE'
    : hasDelete
    ? 'DELETE'
    : '*';
  const channel = supabase()
    .channel(`${table}_changes`)
    .on(
      'postgres_changes',
      {
        event: event as any, // TS types are dumb, but this is actually totally valid without "as any"
        schema: 'public',
        table,
        filter,
      },
      payload => {
        payload.eventType;
        switch (payload.eventType) {
          case 'INSERT':
            insertHandler?.(payload.new as ReturnTable);
            return;
          case 'UPDATE':
            updateHandler?.(payload.new as ReturnTable);
            return;
          case 'DELETE':
            deleteHandler?.(payload.old as ReturnTable);
            return;
        }
      },
    )
    .subscribe((status, err) => {
      if (err) {
        console.error(`${table} : ${event} ${filter} realtime error:`, err);
      } else if (status !== 'SUBSCRIBED') {
        console.log(`${table} : ${event} ${filter} realtime status: ${status}`);
      }
    });
  return () => {
    console.log(`${table} : ${filter} - watcher unsubscribed`);
    channel.unsubscribe();
  };
}

function atLeastTwoTrue(a: boolean, b: boolean, c: boolean) {
  return a !== b ? c : a;
}
