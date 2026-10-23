import type { z } from 'zod';
import {
    fetchUpstream,
    HttpUpstreamError,
    parseUpstreamResponse,
} from '../utils/http';
import { getApiV1Scenarios } from './generated/transitionAPI';
import * as TransitionSchema from './generated/transitionAPI.zod';

export type TransitionScenario = z.infer<
    typeof TransitionSchema.GetApiV1ScenariosResponseItem
>;

export const fetchTransitionScenarios = async (
    token: string,
): Promise<TransitionScenario[]> => {
    const response = await fetchUpstream(() =>
        getApiV1Scenarios({
            headers: { Authorization: `Bearer ${token}` },
        }),
    );
    if (response.status !== 200) {
        throw new HttpUpstreamError(response);
    }
    return parseUpstreamResponse(
        TransitionSchema.GetApiV1ScenariosResponse,
        response.data,
    );
};
