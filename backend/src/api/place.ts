import express from 'express';
import { Api } from 'common';
import { geocoder } from '../geocoder/geocoder-factory';
import { ApiError, parseRequest } from '../utils/http';

const handlePlaceSearch = async (
    req: express.Request,
    res: express.Response,
) => {
    const body = parseRequest(Api.placeSearchEndpoint.body, req.body);
    res.json(await geocoder.searchPlaces(body));
};

const handlePlaceLookup = async (
    req: express.Request,
    res: express.Response,
) => {
    const { id } = parseRequest(Api.placeLookupEndpoint.params, req.params);
    const place = await geocoder.lookUpPlace(id);
    if (!place) {
        throw new ApiError(404, { error: `Place not found: ${id}` });
    }
    res.json(place);
};

export const placeRouter = express.Router();
placeRouter[Api.placeSearchEndpoint.method](
    Api.placeSearchEndpoint.path,
    handlePlaceSearch,
);
placeRouter[Api.placeLookupEndpoint.method](
    Api.placeLookupEndpoint.path,
    handlePlaceLookup,
);
