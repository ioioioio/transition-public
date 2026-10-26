import express from 'express';
import { config } from './config';
import { ApiError, UpstreamError } from './utils/http';
import { createPlaceRouter } from './api/place';
import { createRouteRouter } from './api/route';
import { createGeocoder } from './geocoder/geocoder-factory';
import { RouteFetcher } from './routing/routes/fetch-routes';
import { ScenarioIds } from './routing/routes/scenario-ids';
import { TransitionClient } from './transition/transition-client';

const app = express();
const geocoder = createGeocoder(config.private.geocoder);
const transition = await TransitionClient.create(config.private.transition);
// Found at startup, so that a wrong name in the config stops the backend
const scenarioIds = new ScenarioIds(
    config.public.routingSetups,
    await transition.fetchScenarios(),
);
const routeFetcher = new RouteFetcher(
    scenarioIds,
    transition,
    config.public.transitionRouting,
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(createPlaceRouter(geocoder));
app.use(createRouteRouter(routeFetcher, config.public));

// Only ApiErrors are meant for the client: the details of the others stay in
// the logs
app.use(((error, _req, res, _next) => {
    if (error instanceof ApiError) {
        res.status(error.status).json(error.body);
        return;
    }
    console.error(error);
    res.sendStatus(error instanceof UpstreamError ? 502 : 500);
}) satisfies express.ErrorRequestHandler);

app.listen(config.private.port);
