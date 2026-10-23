import { config } from '../config';
import { postToken } from './generated/transitionAPI';

const getTransitionToken = async () => {
    const response = await postToken({
        usernameOrEmail: config.private.transition.userName,
        password: config.private.transition.password,
    });
    if (response.status !== 200) {
        throw new Error(
            `Authentication on Transition failed: ${response.status} ${response.data}`,
        );
    }
    return response.data;
};

export const transitionToken = await getTransitionToken();
