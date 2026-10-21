import type { z } from 'zod';
import { ApiError, parseUpstreamResponse } from '../utils/http';
import { postApiV1Route } from './generated/transitionAPI';
import * as TransitionSchema from './generated/transitionAPI.zod';
import type { PostApiV1RouteBody } from './generated/model';
import { transitionToken } from './token';

export type TransitionRouteResponse = z.infer<
    typeof TransitionSchema.PostApiV1RouteResponse
>;

export const postTransitionRoute = async (
    body: PostApiV1RouteBody,
): Promise<TransitionRouteResponse> => {
    const response = await postApiV1Route(body, undefined, {
        headers: { Authorization: `Bearer ${transitionToken}` },
    });
    if (response.status !== 200) {
        throw new ApiError(response.status, response.data);
    }
    return parseUpstreamResponse(
        TransitionSchema.PostApiV1RouteResponse,
        response.data,
    );
};
