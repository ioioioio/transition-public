import { z } from 'zod';

import * as Utils from '../utils';
import * as Tr from '../transition';

export const TripTimeTypeSchema = z.enum(['departure', 'arrival']);
export type TripTimeType = z.infer<typeof TripTimeTypeSchema>;

export const TripTimeSchema = z.object({
    type: TripTimeTypeSchema,
    secondsSinceMidnight: z.int().min(0),
});

export type TripTime = z.infer<typeof TripTimeSchema>;

export const RouteBodySchema = z.object({
    origin: Utils.LngLatSchema,
    destination: Utils.LngLatSchema,
    time: TripTimeSchema.optional(),
});

export type RouteBody = z.infer<typeof RouteBodySchema>;

export const RouteResponseSchema = Tr.Schema.PostApiV1RouteResponse;
export type RouteResponse = z.infer<typeof RouteResponseSchema>;

export const routeEndpoint = {
    method: 'post',
    path: '/api/route',
    body: RouteBodySchema,
    response: RouteResponseSchema,
} as const;
