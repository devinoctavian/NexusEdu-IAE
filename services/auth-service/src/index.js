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

import jwt from 'jsonwebtoken';
app.post('/api/v1/auth/login', (req, res) => {
  const { nim } = req.body;
  // Create a real JWT for the mock user
  const token = jwt.sign(
    { id: '123-uuid', nim: nim || '1301190001', role: 'student', name: 'Devin Octavian' },
    process.env.JWT_SECRET || 'nexus_super_secret_key_change_in_prod',
    { expiresIn: '1d' }
  );
  res.json({
    status: 'success',
    data: { token, user: { nim: nim || '1301190001', role: 'student', name: 'Devin Octavian' } },
    meta: { timestamp: new Date().toISOString() },
    errors: null
  });
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  logger.info(`Auth Service listening on port ${PORT}`);
});
