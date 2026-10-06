import express from 'express';
import { Api } from 'common';
import { getAutocomplete, getPlace } from '../pelias/client';
import * as Pelias from '../pelias/schema';

const createPlace = ({ geometry, properties }: Pelias.Feature): Api.Place => ({
    id: properties.gid,
    label: properties.label,
    position: { lng: geometry.coordinates[0], lat: geometry.coordinates[1] },
});

const handlePlaceSearch = async (
    req: express.Request<object, unknown, unknown>,
    res: express.Response,
) => {
    const request = Api.placeSearchEndpoint.body.safeParse(req.body);
    if (!request.success) {
        res.status(400).json({ error: request.error.issues });
        return;
    }
    const response = await getAutocomplete(request.data);
    if (!response.ok) {
        res.status(response.status).json(await response.json());
        return;
    }
    const places = Pelias.FeatureCollectionSchema.safeParse(
        await response.json(),
    );
    if (!places.success) {
        res.status(502).json({ error: places.error.issues });
        return;
    }
    res.json(places.data.features.map(createPlace));
};

const handlePlaceLookup = async (
    req: express.Request,
    res: express.Response,
) => {
    const request = Api.placeLookupEndpoint.params.safeParse(req.params);
    if (!request.success) {
        res.status(400).json({ error: request.error.issues });
        return;
    }
    const response = await getPlace(request.data.id);
    if (!response.ok) {
        res.status(response.status).json(await response.json());
        return;
    }
    const places = Pelias.FeatureCollectionSchema.safeParse(
        await response.json(),
    );
    if (!places.success) {
        res.status(502).json({ error: places.error.issues });
        return;
    }
    const [feature] = places.data.features;
    if (!feature) {
        res.status(404).json({ error: `Place not found: ${request.data.id}` });
        return;
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
