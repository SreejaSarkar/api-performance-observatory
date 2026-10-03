import { MetricsIngestionController } from './metrics-ingestion.controller';
import { BatchMetricDto } from './dto/batch-metric.dto';
import { CreateMetricDto } from './dto/create-metric.dto';
import { MetricsService } from './metrics.service';

describe('MetricsIngestionController', () => {
  let controller: MetricsIngestionController;
  let metricsService: jest.Mocked<MetricsService>;

  const request = {
    project: {
      id: 'project-1',
    },
  } as unknown as Parameters<MetricsIngestionController['ingestMetric']>[1];

  beforeEach(() => {
    metricsService = {
      createMetric: jest.fn(),
      createMany: jest.fn(),
    } as unknown as jest.Mocked<MetricsService>;

    controller = new MetricsIngestionController(metricsService);
  });

  it('ingests a single metric for the request project', async () => {
    const dto: CreateMetricDto = {
      endpoint: '/health',
      latency: 120,
      requests: 1,
      statusCode: 200,
    };

    await controller.ingestMetric(dto, request);

    expect(metricsService.createMetric.mock.calls).toEqual([
      [dto, 'project-1'],
    ]);
  });

  it('ingests a metric batch for the request project', async () => {
    const dto: BatchMetricDto = {
      metrics: [
        {
          endpoint: '/health',
          latency: 120,
          requests: 1,
          statusCode: 200,
        },
        {
          endpoint: '/checkout',
          latency: 240,
          requests: 2,
          statusCode: 500,
        },
      ],
    };

    await controller.batchIngest(dto, request);

    expect(metricsService.createMany.mock.calls).toEqual([
      [dto.metrics, 'project-1'],
    ]);
  });
});
