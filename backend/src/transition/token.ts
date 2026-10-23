import { postToken } from './generated/transitionAPI';

type TransitionCredentials = {
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
        throw new Error(
            `Authentication on Transition failed: ${response.status} ${response.data}`,
        );
    }
    return response.data;
};
