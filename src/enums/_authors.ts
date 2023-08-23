export const Human = "human" as const;
export const Ai = "ai" as const;

export type TYPE = typeof Human | typeof Ai;

export const members = [Human, Ai] as const;
