import { getEnv } from '../env';
import { PostApiV1RouteBody } from './generated/model';

const transitionEndpoint = getEnv('TRANSITION_ENDPOINT');
const transitionUserName = getEnv('TRANSITION_USER_NAME');
const transitionUserPassword = getEnv('TRANSITION_USER_PASSWORD');

export const getTransitionToken = async () => {
    const response = await fetch(`${transitionEndpoint}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            usernameOrEmail: transitionUserName,
            password: transitionUserPassword,
        }),
    });
    const token = await response.text();
    if (!response.ok) {
        throw new Error(`Authentication on Transition failed: ${response.status} ${token}`);
    }
    return token;
};

export const getRoute = async (token: string, request: PostApiV1RouteBody) => {
    const response = await fetch(`${transitionEndpoint}/api/v1/route`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
    });
    if (!response.ok) {
        throw new Error(`Transition route request failed: ${response.status} ${await response.text()}`);
    }
    return response.json();
};
