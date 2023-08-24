import { Enum } from '../utils/supabase';

export const Human = 'human' as const;
export const Ai = 'ai' as const;

export type TYPE = Enum<'author_type'>;

export const members: TYPE[] = [Human, Ai];
