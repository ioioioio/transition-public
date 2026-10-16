import { queryOptions, skipToken, useQueries } from '@tanstack/react-query';
import { Api, Utils } from 'common';

import { config } from '@/config/config';

const fetchRoute = async (
    body: Api.RouteBody,
    signal: AbortSignal,
): Promise<Api.RouteResponse> => {
    const { method, path, response } = Api.routeEndpoint;
    const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });
    if (!res.ok) {
        throw new Error(
            `Route request failed: ${res.status} ${await res.text()}`,
        );
    }
    return response.parse(await res.json());
};

export const createRouteQueryOptions = (
    routingSetupId: string,
    origin: Utils.LngLat | null,
    destination: Utils.LngLat | null,
    time: Api.TripTime,
) => {
    return queryOptions({
        queryKey: ['route', routingSetupId, origin, destination, time],
        queryFn:
            origin && destination
                ? ({ signal }) =>
                      fetchRoute(
                          { routingSetupId, origin, destination, time },
                          signal,
                      )
                : skipToken,
        staleTime: Infinity, // Routes are never updated on the backend
    });
};

export const useRouteQueries = (
    origin: Utils.LngLat | null,
    destination: Utils.LngLat | null,
    time: Api.TripTime,
) => {
    return useQueries({
        queries: config.routingSetups.map(({ id }) =>
            createRouteQueryOptions(id, origin, destination, time),
        ),
        combine: (results) => ({
            alternatives: results.flatMap(
                ({ data }) => data?.alternatives ?? [],
            ),
            isFetching: results.some(({ isFetching }) => isFetching),
        }),
    });
};
