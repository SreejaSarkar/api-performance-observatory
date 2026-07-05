import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const endpoints = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/users',
  '/api/users/profile',
  '/api/orders',
  '/api/orders/:id',
  '/api/products',
  '/api/products/:id',
  '/api/payments',
  '/api/analytics',
];

function randomLatency() {
  return Math.floor(Math.random() * 900 + 50);
}

function randomRequests() {
  return Math.floor(Math.random() * 500 + 10);
}

function randomStatusCode() {
  const roll = Math.random();

  if (roll < 0.85) {
    return 200;
  }

  if (roll < 0.95) {
    return 404;
  }

  return 500;
}

async function main() {
  console.log('Seeding...');

  for (let p = 1; p <= 5; p++) {
    const project = await prisma.project.create({
      data: {
        name: `Project ${p}`,
        apiKey: randomUUID(),
      },
    });

    console.log(`Created ${project.name}`);

    const metrics: Prisma.ApiMetricCreateManyInput[] = [];

    for (let i = 0; i < 1000; i++) {
      metrics.push({
        projectId: project.id,

        endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],

        latency: randomLatency(),

        requests: randomRequests(),

        statusCode: randomStatusCode(),

        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
        ),
      });
    }

    await prisma.apiMetric.createMany({
      data: metrics,
    });

    console.log(`Inserted ${metrics.length} metrics`);
  }

  console.log('Done');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
