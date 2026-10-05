import { z } from 'zod';

import * as Utils from '../utils';

export const PlaceSearchBodySchema = z.object({
    text: z.string().trim().min(1).max(200),
    focus: Utils.LngLatSchema.optional(),
});

export type PlaceSearchBody = z.infer<typeof PlaceSearchBodySchema>;

export const PlaceSchema = z.object({
    id: z.string(),
    label: z.string(),
    position: Utils.LngLatSchema,
});

export type Place = z.infer<typeof PlaceSchema>;

export const PlaceSearchResponseSchema = z.array(PlaceSchema);
export type PlaceSearchResponse = z.infer<typeof PlaceSearchResponseSchema>;

export const placeSearchEndpoint = {
    method: 'post',
    path: '/api/places/search',
    body: PlaceSearchBodySchema,
    response: PlaceSearchResponseSchema,
} as const;
