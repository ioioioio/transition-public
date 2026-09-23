import express from 'express';
import { getEnv } from './env.ts';

const app = express();
const port = getEnv('BACKEND_PORT');

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port);
