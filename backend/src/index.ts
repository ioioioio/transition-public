import express from 'express';
import { config } from './config';
import { ApiError } from './utils/http';
import { createPlaceRouter } from './api/place';
import { createRouteRouter } from './api/route';
import { createGeocoder } from './geocoder/geocoder-factory';
import { RouteFetcher } from './routing/routes/fetch-routes';
import { ScenarioIds } from './routing/routes/scenario-ids';
import { fetchTransitionScenarios } from './transition/scenarios';

const app = express();
const geocoder = createGeocoder(config.private.geocoder);
// Found at startup, so that a wrong name in the config stops the backend
const scenarioIds = new ScenarioIds(
    config.public.routingSetups,
    await fetchTransitionScenarios(),
);
const routeFetcher = new RouteFetcher(scenarioIds);

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(createPlaceRouter(geocoder));
app.use(createRouteRouter(routeFetcher));

app.use(((error, _req, res, _next) => {
    if (error instanceof ApiError) {
        res.status(error.status).json(error.body);
        return;
    }
    res.status(502).json({
        error: error instanceof Error ? error.message : 'Unknown error',
    });
}) satisfies express.ErrorRequestHandler);

app.listen(config.private.port);
