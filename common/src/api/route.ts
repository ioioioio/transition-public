import { z } from 'zod';

import * as Utils from '../utils';
import { RouteAlternativeSchema } from './route-alternative';

export const TripTimeTypeSchema = z.enum(['departure', 'arrival']);
export type TripTimeType = z.infer<typeof TripTimeTypeSchema>;

export const TripTimeSchema = z.object({
    type: TripTimeTypeSchema,
    secondsSinceMidnight: z.int().min(0),
});

export type TripTime = z.infer<typeof TripTimeSchema>;

export const RouteBodySchema = z.object({
    routingSetupId: z.string().min(1),
    origin: Utils.LngLatSchema,
    destination: Utils.LngLatSchema,
    time: TripTimeSchema,
});

export type RouteBody = z.infer<typeof RouteBodySchema>;

export const RouteResponseSchema = z.object({
    alternatives: z.array(RouteAlternativeSchema),
});
export type RouteResponse = z.infer<typeof RouteResponseSchema>;

export const routeEndpoint = {
    method: 'post',
    path: '/api/route',
    body: RouteBodySchema,
    response: RouteResponseSchema,
} as const;
