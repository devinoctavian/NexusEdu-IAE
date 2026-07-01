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
    data: { service: 'auth-service', status: 'UP' },
    meta: { timestamp: new Date().toISOString() },
    errors: null
  });
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  logger.info(`Auth Service listening on port ${PORT}`);
});
