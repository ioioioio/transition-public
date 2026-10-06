import express from 'express';
import { getEnv } from './utils/env';
import { ApiError } from './utils/http';
import { placeRouter } from './api/place';
import { routeRouter } from './api/route';

const app = express();
const port = getEnv('BACKEND_PORT');

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(placeRouter);
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
