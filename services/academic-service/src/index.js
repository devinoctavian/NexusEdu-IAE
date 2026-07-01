import express from 'express';
import pinoHttp from 'pino-http';
import pino from 'pino';

const logger = pino();
const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    data: { service: 'academic-service', status: 'UP' },
    meta: { timestamp: new Date().toISOString() },
    errors: null
  });
});

const PORT = process.env.PORT || 8002;
app.listen(PORT, () => {
  logger.info(`Academic Service listening on port ${PORT}`);
});
