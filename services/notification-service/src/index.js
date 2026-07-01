import express from 'express';
import pinoHttp from 'pino-http';
import pino from 'pino';
import amqp from 'amqplib';
import 'dotenv/config';

const logger = pino();
const app = express();

app.use(pinoHttp({ logger }));

app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    data: { service: 'notification-service', status: 'UP' },
    meta: { timestamp: new Date().toISOString() },
    errors: null
  });
});

async function startRabbitMQ() {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    const ch = await conn.createChannel();
    
    const dlx = 'dlx.notifications';
    const dlq = 'dlq.notifications';
    const mainExchange = 'exc.notifications';
    const mainQueue = 'nexusedu.notifications';

    // Setup DLQ
    await ch.assertExchange(dlx, 'direct', { durable: true });
    await ch.assertQueue(dlq, { durable: true });
    await ch.bindQueue(dlq, dlx, 'failed_notification');

    // Setup Main Queue with DLX
    await ch.assertExchange(mainExchange, 'direct', { durable: true });
    await ch.assertQueue(mainQueue, {
      durable: true,
      deadLetterExchange: dlx,
      deadLetterRoutingKey: 'failed_notification'
    });
    await ch.bindQueue(mainQueue, mainExchange, 'send_notification');

    logger.info('RabbitMQ Connected and Queues Asserted');

    ch.consume(mainQueue, (msg) => {
      if (msg !== null) {
        try {
          const payload = JSON.parse(msg.content.toString());
          logger.info({ payload }, 'Received notification payload');
          // Process notification...
          ch.ack(msg);
        } catch (error) {
          logger.error(error, 'Error processing message');
          ch.nack(msg, false, false); // Route to DLX
        }
      }
    });
  } catch (error) {
    logger.error(error, 'RabbitMQ Connection Failed');
  }
}

const PORT = process.env.PORT || 8006;
app.listen(PORT, () => {
  logger.info(`Notification Service listening on port ${PORT}`);
  startRabbitMQ();
});
