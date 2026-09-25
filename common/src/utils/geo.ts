import { z } from 'zod';

export const LngLatSchema = z.object({
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90),
});

export type LngLat = z.infer<typeof LngLatSchema>;
