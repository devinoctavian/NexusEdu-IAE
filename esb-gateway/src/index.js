import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import pinoHttp from 'pino-http';
import pino from 'pino';
import 'dotenv/config';

import { correlationIdMiddleware } from './middleware/correlation-id.js';
import { globalLimiter } from './middleware/rate-limit.js';
import { authValidate } from './middleware/auth-validate.js';
import { dashboardAggregator } from './patterns/aggregator.js';
import { enrollmentSaga } from './patterns/saga.js';
import { soapBridge } from './patterns/soap-bridge.js';

const logger = pino();
const app = express();

app.use(helmet());
app.use(cors());
app.use(pinoHttp({ logger }));
app.use(correlationIdMiddleware);
app.use(globalLimiter);

// For parsing JSON in custom patterns
// Note: http-proxy-middleware generally prefers we don't parse body before proxying
// So we use it conditionally for pattern routes
const jsonParser = express.json();

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'ESB Gateway' }));

// ===== ESB Custom Patterns ===== //
// Aggregator
app.get('/api/v1/student/dashboard', authValidate, dashboardAggregator);

// Saga
app.post('/api/v1/academic/enrollments', jsonParser, authValidate, enrollmentSaga);

// SOAP Bridge
app.post('/api/v1/student-affairs/attendance', jsonParser, authValidate, soapBridge);

// ===== Passthrough Routing ===== //
const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: { '^/api/v1': '/api/v1' } // Preserve path
});

// Protect all internal services with JWT
app.use('/api/v1', authValidate);

// Map routes to internal services
app.use('/api/v1/auth', createProxy('http://localhost:8001'));
app.use('/api/v1/academic', createProxy('http://localhost:8002'));
app.use('/api/v1/finance', createProxy('http://localhost:8003'));
app.use('/api/v1/library', createProxy('http://localhost:8004'));
app.use('/api/v1/student-affairs', createProxy('http://localhost:8005')); // Non-SOAP REST routes

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  logger.info(`ESB Gateway listening on port ${PORT}`);
});
