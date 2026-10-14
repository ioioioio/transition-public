// The means of transport the app knows, with `other` for any other one
export const modes = [
    'bus',
    'driving',
    'metro',
    'rail',
    'walking',
    'other',
] as const;

export type Mode = (typeof modes)[number];

export const isMode = (value: string): value is Mode =>
    (modes as readonly string[]).includes(value);
