import {
    postTransitionRoute,
    type TransitionRouteBody,
    type TransitionRouteResponse,
} from './route';
import { fetchTransitionScenarios, type TransitionScenario } from './scenarios';
import { fetchTransitionToken, type TransitionCredentials } from './token';

// Logged in to Transition
export class TransitionClient {
    private constructor(private readonly token: string) {}

    static async create(
        credentials: TransitionCredentials,
    ): Promise<TransitionClient> {
        return new TransitionClient(await fetchTransitionToken(credentials));
    }

    postRoute(body: TransitionRouteBody): Promise<TransitionRouteResponse> {
        return postTransitionRoute(this.token, body);
    }

    fetchScenarios(): Promise<TransitionScenario[]> {
        return fetchTransitionScenarios(this.token);
    }
}
