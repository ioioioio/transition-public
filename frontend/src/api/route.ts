import { queryOptions, skipToken, useQuery } from '@tanstack/react-query';
import { Api, Utils } from 'common';

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
    origin: Utils.LngLat | null,
    destination: Utils.LngLat | null,
    time: Api.TripTime,
) => {
    return queryOptions({
        queryKey: [
            'route',
            origin?.lng,
            origin?.lat,
            destination?.lng,
            destination?.lat,
            time
        ],
        queryFn:
            origin && destination
                ? ({ signal }) =>
                      fetchRoute({ origin, destination, time }, signal)
                : skipToken,
        staleTime: Infinity, // Routes are never updated on the backend
    });
};

export const useRouteQuery = (
    origin: Utils.LngLat | null,
    destination: Utils.LngLat | null,
    time: Api.TripTime,
) => {
    return useQuery(createRouteQueryOptions(origin, destination, time));
};
