import type { z } from 'zod';
import {
    fetchUpstream,
    HttpUpstreamError,
    parseUpstreamResponse,
} from '../utils/http';
import { postApiV1Route } from './generated/transitionAPI';
import * as TransitionSchema from './generated/transitionAPI.zod';
import type { PostApiV1RouteBody } from './generated/model';

export type TransitionRouteBody = PostApiV1RouteBody;

export type TransitionRouteResponse = z.infer<
    typeof TransitionSchema.PostApiV1RouteResponse
>;

export const postTransitionRoute = async (
    token: string,
    body: TransitionRouteBody,
): Promise<TransitionRouteResponse> => {
    const response = await fetchUpstream(() =>
        postApiV1Route(body, undefined, {
            headers: { Authorization: `Bearer ${token}` },
        }),
    );
    if (response.status !== 200) {
        throw new HttpUpstreamError(response);
    }
    return parseUpstreamResponse(
        TransitionSchema.PostApiV1RouteResponse,
        response.data,
    );
};
