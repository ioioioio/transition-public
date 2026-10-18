import { z } from 'zod';

// The means of transport the app knows, with `other` for any other one
export const ModeSchema = z.enum([
    'bus',
    'driving',
    'metro',
    'plane',
    'rail',
    'walking',
    'other',
]);

export type Mode = z.infer<typeof ModeSchema>;
