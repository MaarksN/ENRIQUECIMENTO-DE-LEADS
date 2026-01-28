import Fastify from 'fastify';
import leadRoutes from './modules/leads/routes';

const app = Fastify({ logger: true });

// Register Modules
app.register(leadRoutes, { prefix: '/leads' });

// Health Check
app.get('/health', async () => {
  return { status: 'ok', agent: 'active' };
});

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' });
    console.log('🚀 Hunter Agent API running on port 3000');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
