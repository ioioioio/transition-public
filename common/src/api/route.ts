import { z } from 'zod';

import * as Utils from '../utils';
import * as Tr from '../transition';

export const RouteBodySchema = z.object({
    origin: Utils.LngLatSchema,
    destination: Utils.LngLatSchema,
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
