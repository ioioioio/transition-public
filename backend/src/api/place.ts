import express from 'express';
import { Api } from 'common';
import { getAutocomplete, getPlace } from '../pelias/client';
import type * as Pelias from '../pelias/schema';
import { ApiError, parseRequest } from '../utils/http';

const createPlace = ({ geometry, properties }: Pelias.Feature): Api.Place => ({
    id: properties.gid,
    label: properties.label,
    position: { lng: geometry.coordinates[0], lat: geometry.coordinates[1] },
});

const handlePlaceSearch = async (
    req: express.Request,
    res: express.Response,
) => {
    const body = parseRequest(Api.placeSearchEndpoint.body, req.body);
    const features = await getAutocomplete(body);
    res.json(features.map(createPlace));
};

const handlePlaceLookup = async (
    req: express.Request,
    res: express.Response,
) => {
    const { id } = parseRequest(Api.placeLookupEndpoint.params, req.params);
    const [feature] = await getPlace(id);
    if (!feature) {
        throw new ApiError(404, { error: `Place not found: ${id}` });
    }
    res.json(createPlace(feature));
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
