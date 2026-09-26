import { getEnv } from '../env';
import { postToken } from './generated/transitionAPI';

export const getTransitionToken = async () => {
    const response = await postToken({
        usernameOrEmail: getEnv('TRANSITION_USER_NAME'),
        password: getEnv('TRANSITION_USER_PASSWORD'),
    });
    if (response.status !== 200) {
        throw new Error(`Authentication on Transition failed: ${response.status} ${response.data}`);
    }
    return response.data;
};
