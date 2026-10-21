import type { z } from 'zod';
import { parseUpstreamResponse } from '../utils/http';
import { getApiV1Scenarios } from './generated/transitionAPI';
import * as TransitionSchema from './generated/transitionAPI.zod';
import { transitionToken } from './token';

export type TransitionScenario = z.infer<
    typeof TransitionSchema.GetApiV1ScenariosResponseItem
>;

export const fetchTransitionScenarios = async (): Promise<
    TransitionScenario[]
> => {
    const response = await getApiV1Scenarios({
        headers: { Authorization: `Bearer ${transitionToken}` },
    });
    if (response.status !== 200) {
        throw new Error(
            `Fetching the scenarios from Transition failed: ${response.status}`,
        );
    }
    return parseUpstreamResponse(
        TransitionSchema.GetApiV1ScenariosResponse,
        response.data,
    );
};
