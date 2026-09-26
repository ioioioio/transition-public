import express from 'express';
import { Transition as Tr } from 'common';
import { getEnv } from './env';
import { getTransitionToken } from './transition/token';
import { postApiV1Route } from './transition/generated/transitionAPI';

const app = express();
const port = getEnv('BACKEND_PORT');

const transitionToken = await getTransitionToken();

app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/route', async (req: express.Request<object, unknown, unknown>, res) => {
    const request = Tr.Schema.PostApiV1RouteBody.safeParse(req.body);
    if (!request.success) {
        res.status(400).json({ error: request.error.issues });
        return;
    }
    try {
        const response = await postApiV1Route(request.data, undefined, {
            headers: { Authorization: `Bearer ${transitionToken}` },
        });
        res.status(response.status).json(response.data);
    } catch (error) {
        res.status(502).json({
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});

app.listen(port);
