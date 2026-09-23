import express from 'express';
import { getEnv } from './env.ts';
import { getTransitionToken } from './transition.ts';

const app = express();
const port = getEnv('BACKEND_PORT');

const transitionToken = await getTransitionToken();
console.log('Transition token:', transitionToken);

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port);
