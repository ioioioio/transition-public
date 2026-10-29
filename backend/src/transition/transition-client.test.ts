import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
    afterAll,
    afterEach,
    beforeAll,
    describe,
    expect,
    it,
    vi,
} from 'vitest';
import { HttpUpstreamError } from '../utils/http';
import { TransitionClient } from './transition-client';

const transitionUrl = process.env['TRANSITION_URL'];

const credentials = { userName: 'user', password: 'password' };

const fakeScenarios = [
    {
        id: 'scenario-1',
        name: 'reference',
        services: [],
        only_agencies: [],
        except_agencies: [],
        only_lines: [],
        except_lines: [],
        only_modes: [],
        except_modes: [],
    },
];

const server = setupServer();

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

interface FakeTransitionOptions {
    // Handed out by the successive logins. Null when Transition is unavailable
    loginTokens: (string | null)[];
    // The only token the scenarios request accepts
    validToken: string;
    // Instead of the scenarios, every time
    scenariosStatus?: number;
}

// Returns a spy per endpoint, called by each of its requests
const setUpFakeTransition = (options: FakeTransitionOptions) => {
    // Hands out the next login token, and undefined once there are none left
    const tokenEndpoint = vi.fn<() => string | null | undefined>();
    for (const token of options.loginTokens) {
        tokenEndpoint.mockReturnValueOnce(token);
    }
    const scenariosEndpoint = vi.fn<() => void>();
    server.use(
        http.post(`${transitionUrl}/token`, () => {
            const token = tokenEndpoint();
            return token
                ? HttpResponse.text(token)
                : HttpResponse.text('Service Unavailable', { status: 503 });
        }),
        http.get(`${transitionUrl}/api/v1/scenarios`, ({ request }) => {
            scenariosEndpoint();
            if (options.scenariosStatus) {
                return new HttpResponse(null, {
                    status: options.scenariosStatus,
                });
            }
            const authorization = request.headers.get('Authorization');
            return authorization === `Bearer ${options.validToken}`
                ? HttpResponse.json(fakeScenarios)
                : HttpResponse.text('Unauthorized', { status: 401 });
        }),
    );
    return { tokenEndpoint, scenariosEndpoint };
};

describe('authentication', () => {
    it('logs in when created, and uses the token', async () => {
        const spies = setUpFakeTransition({
            loginTokens: ['token-1'],
            validToken: 'token-1',
        });
        const client = await TransitionClient.create(credentials);
        await expect(client.fetchScenarios()).resolves.toEqual(fakeScenarios);
        expect(spies.tokenEndpoint).toHaveBeenCalledTimes(1);
    });

    it('logs in again when the token is refused, and retries', async () => {
        const spies = setUpFakeTransition({
            loginTokens: ['token-1', 'token-2'],
            validToken: 'token-2',
        });
        const client = await TransitionClient.create(credentials);
        await expect(client.fetchScenarios()).resolves.toEqual(fakeScenarios);
        expect(spies.tokenEndpoint).toHaveBeenCalledTimes(2);
    });

    it('retries only once', async () => {
        const spies = setUpFakeTransition({
            loginTokens: ['token-1', 'token-2', 'token-3'],
            validToken: 'token-3',
        });
        const client = await TransitionClient.create(credentials);
        await expect(client.fetchScenarios()).rejects.toMatchObject({
            status: 401,
        });
        expect(spies.scenariosEndpoint).toHaveBeenCalledTimes(2);
        expect(spies.tokenEndpoint).toHaveBeenCalledTimes(2);
    });

    it('fails on other errors without logging in again', async () => {
        const spies = setUpFakeTransition({
            loginTokens: ['token-1'],
            validToken: 'token-1',
            scenariosStatus: 500,
        });
        const client = await TransitionClient.create(credentials);
        await expect(client.fetchScenarios()).rejects.toBeInstanceOf(
            HttpUpstreamError,
        );
        expect(spies.tokenEndpoint).toHaveBeenCalledTimes(1);
    });

    it("waits for another request's login instead of logging in too", async () => {
        const spies = setUpFakeTransition({
            loginTokens: ['token-1', 'token-2'],
            validToken: 'token-2',
        });
        const client = await TransitionClient.create(credentials);
        await Promise.all([
            client.fetchScenarios(),
            client.fetchScenarios(),
            client.fetchScenarios(),
        ]);
        expect(spies.tokenEndpoint).toHaveBeenCalledTimes(2);
    });

    it('when refused late, retries with the token another request already renewed', async () => {
        const spies = setUpFakeTransition({
            loginTokens: ['token-1', 'token-2'],
            validToken: 'token-2',
        });
        const heldRefusal = Promise.withResolvers<undefined>();
        server.use(
            http.get(
                `${transitionUrl}/api/v1/scenarios`,
                async () => {
                    await heldRefusal.promise;
                    return HttpResponse.text('Unauthorized', { status: 401 });
                },
                { once: true },
            ),
        );
        const client = await TransitionClient.create(credentials);
        const heldRequest = client.fetchScenarios();
        await client.fetchScenarios();
        heldRefusal.resolve(undefined);
        await expect(heldRequest).resolves.toEqual(fakeScenarios);
        expect(spies.tokenEndpoint).toHaveBeenCalledTimes(2);
    });

    it('logs in again on the next refusal when Transition was unavailable', async () => {
        const spies = setUpFakeTransition({
            loginTokens: ['token-1', null, 'token-2'],
            validToken: 'token-2',
        });
        const client = await TransitionClient.create(credentials);
        await expect(client.fetchScenarios()).rejects.toMatchObject({
            status: 503,
        });
        await expect(client.fetchScenarios()).resolves.toEqual(fakeScenarios);
        expect(spies.tokenEndpoint).toHaveBeenCalledTimes(3);
    });
});
