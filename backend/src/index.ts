import express from 'express';

const app = express();
const port = 3001;

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port);
