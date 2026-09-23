import { getEnv } from './env.ts';

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
