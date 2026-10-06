import {
    keepPreviousData,
    queryOptions,
    skipToken,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { Api, type Utils } from 'common';

const fetchPlaceSearch = async (
    body: Api.PlaceSearchBody,
    signal: AbortSignal,
): Promise<Api.PlaceSearchResponse> => {
    const { method, path, response } = Api.placeSearchEndpoint;
    const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal,
    });
    if (!res.ok) {
        throw new Error(
            `Place search request failed: ${res.status} ${await res.text()}`,
        );
    }
    return response.parse(await res.json());
};

export const createPlaceSearchQueryOptions = (
    text: string,
    focus?: Utils.LngLat,
) => {
    const trimmedText = text.trim();
    return queryOptions({
        queryKey: ['placeSearch', trimmedText, focus?.lng, focus?.lat],
        queryFn: trimmedText
            ? ({ signal }) =>
                  fetchPlaceSearch({ text: trimmedText, focus }, signal)
            : skipToken,
        // Keep the previous suggestions while typing, instead of flickering,
        // but not once the text is erased
        placeholderData: trimmedText ? keepPreviousData : undefined,
    });
};

export const usePlaceSearchQuery = (text: string, focus?: Utils.LngLat) => {
    return useQuery(createPlaceSearchQueryOptions(text, focus));
};

const fetchPlaceLookup = async (
    id: string,
    signal: AbortSignal,
): Promise<Api.Place> => {
    const { method, path, response } = Api.placeLookupEndpoint;
    const res = await fetch(path.replace(':id', encodeURIComponent(id)), {
        method,
        signal,
    });
    if (!res.ok) {
        throw new Error(
            `Place lookup request failed: ${res.status} ${await res.text()}`,
        );
    }
    return response.parse(await res.json());
};

export const createPlaceLookupQueryOptions = (id: string | undefined) => {
    return queryOptions({
        queryKey: ['placeLookup', id],
        queryFn: id ? ({ signal }) => fetchPlaceLookup(id, signal) : skipToken,
        staleTime: Infinity, // Places are never updated on the backend
    });
};

export const usePlaceLookupQuery = (id: string | undefined) => {
    return useQuery(createPlaceLookupQueryOptions(id));
};

// Saves a place already known, e.g. from the search, so it needs no lookup
export const useSetPlaceLookupQueryData = () => {
    const queryClient = useQueryClient();
    return (place: Api.Place) => {
        queryClient.setQueryData(
            createPlaceLookupQueryOptions(place.id).queryKey,
            place,
        );
    };
};
