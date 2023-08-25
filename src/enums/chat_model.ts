import { Enum } from '../utils/supabase';

export const GPT3_5 = 'gpt-3.5' as const;
export const GPT4 = 'gpt-4' as const;

export type TYPE = Enum<'chat_model'>;
