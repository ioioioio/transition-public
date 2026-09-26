import express from 'express';
import { getEnv } from './utils/env';
import { routeRouter } from './api/route';

const app = express();
const port = getEnv('BACKEND_PORT');

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.use(routeRouter);

app.use(((error, _req, res, _next) => {
    res.status(502).json({
        error: error instanceof Error ? error.message : 'Unknown error',
    });
}) satisfies express.ErrorRequestHandler);

app.listen(port);
