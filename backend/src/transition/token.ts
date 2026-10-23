import { HttpUpstreamError } from '../utils/http';
import { postToken } from './generated/transitionAPI';

export type TransitionCredentials = {
    userName: string;
    password: string;
};

export const fetchTransitionToken = async (
    credentials: TransitionCredentials,
): Promise<string> => {
    const response = await postToken({
        usernameOrEmail: credentials.userName,
        password: credentials.password,
    });
    if (response.status !== 200) {
        throw new HttpUpstreamError(response);
    }
    return response.data;
};
