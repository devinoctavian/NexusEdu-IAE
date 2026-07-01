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
    data: { service: 'finance-service', status: 'UP' },
    meta: { timestamp: new Date().toISOString() },
    errors: null
  });
});

// Used by ESB Saga (Enrollment) to check if student has unpaid invoices
app.get('/api/v1/finance/invoices/unpaid/:studentNim', (req, res) => {
  const { studentNim } = req.params;
  // Mock logic for demo
  const hasUnpaid = false;
  
  if (hasUnpaid) {
    return res.status(403).json({
      status: 'error',
      data: null,
      meta: { timestamp: new Date().toISOString() },
      errors: [{ code: 'UNPAID_INVOICE_EXISTS', detail: 'Student has unpaid invoice' }]
    });
  }

  res.json({
    status: 'success',
    data: { studentNim, canEnroll: true },
    meta: { timestamp: new Date().toISOString() },
    errors: null
  });
});

const PORT = process.env.PORT || 8003;
app.listen(PORT, () => {
  logger.info(`Finance Service listening on port ${PORT}`);
});
