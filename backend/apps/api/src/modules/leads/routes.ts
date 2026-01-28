import { FastifyInstance } from 'fastify';

export default async function leadRoutes(fastify: FastifyInstance) {
  fastify.post('/prospect', async (request, reply) => {
    // Lógica de prospecção (Etapa 2)
    return {
        status: 'queued',
        message: 'Agent is scanning for targets...',
        jobId: 'job_' + Date.now()
    };
  });

  fastify.get('/', async () => {
    return [
        { company: "Tech Corp", score: 92, status: "READY" },
        { company: "Retail Solutions", score: 88, status: "ENRICHING" }
    ];
  });
}
