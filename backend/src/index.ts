import express from 'express';
import { getEnv } from './utils/env';
import { ApiError } from './utils/http';
import { createPlaceRouter } from './api/place';
import { routeRouter } from './api/route';
import { createGeocoder } from './geocoder/geocoder-factory';

const app = express();
const port = getEnv('BACKEND_PORT');
const geocoder = createGeocoder();

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(createPlaceRouter(geocoder));
app.use(routeRouter);

app.use(((error, _req, res, _next) => {
    if (error instanceof ApiError) {
        res.status(error.status).json(error.body);
        return;
    }
    res.status(502).json({
        error: error instanceof Error ? error.message : 'Unknown error',
    });
}) satisfies express.ErrorRequestHandler);

app.listen(port);
