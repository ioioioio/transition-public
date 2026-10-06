import {
    keepPreviousData,
    queryOptions,
    skipToken,
    useQuery,
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
