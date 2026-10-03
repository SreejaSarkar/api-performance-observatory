import { PrismaService } from '../prisma/prisma.service';
import { ReportsService } from './reports.service';

jest.mock('json2csv', () => ({
  Parser: jest.fn(),
}));

const {
  Parser: mockParserConstructor,
}: {
  Parser: jest.Mock;
} = jest.requireMock('json2csv');

jest.mock('pdfkit', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn().mockReturnThis(),
    fontSize: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    fillColor: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    end: jest.fn(),
    y: 100,
  }));
});

type PrismaMocks = {
  apiMetric: {
    findMany: jest.Mock;
  };
  anomaly: {
    count: jest.Mock;
  };
};

describe('ReportsService', () => {
  let service: ReportsService;
  let prisma: PrismaMocks;
  let mockParse: jest.Mock;

  beforeEach(() => {
    prisma = {
      apiMetric: {
        findMany: jest.fn(),
      },
      anomaly: {
        count: jest.fn(),
      },
    };

    mockParse = jest.fn().mockReturnValue('endpoint,avgLatency\n/checkout,200');
    mockParserConstructor.mockImplementation(
      () =>
        ({
          parse: mockParse,
        }) as never,
    );

    service = new ReportsService(prisma as unknown as PrismaService);
  });

  it('returns an empty report when no metrics exist for the period', async () => {
    prisma.apiMetric.findMany.mockResolvedValue([]);

    await expect(service.generateReportData('project-1', 24)).resolves.toEqual({
      summary: null,
      endpoints: [],
    });

    expect(prisma.anomaly.count).not.toHaveBeenCalled();
  });

  it('aggregates metrics into summary and endpoint report data', async () => {
    prisma.apiMetric.findMany.mockResolvedValue([
      {
        endpoint: '/checkout',
        latency: 100,
        statusCode: 200,
        requests: 10,
        createdAt: new Date('2026-09-29T10:00:00.000Z'),
      },
      {
        endpoint: '/checkout',
        latency: 300,
        statusCode: 500,
        requests: 4,
        createdAt: new Date('2026-09-29T11:00:00.000Z'),
      },
      {
        endpoint: '/health',
        latency: 50,
        statusCode: 200,
        requests: 6,
        createdAt: new Date('2026-09-29T12:00:00.000Z'),
      },
    ]);
    prisma.anomaly.count.mockResolvedValue(3);

    const result = await service.generateReportData('project-1', 24);

    const anomalyCountCalls = prisma.anomaly.count.mock.calls as Array<
      [
        {
          where: {
            projectId: string;
            detectedAt: {
              gte: Date;
            };
          };
        },
      ]
    >;
    const anomalyCountArgs = anomalyCountCalls[0][0];

    expect(anomalyCountArgs.where.projectId).toBe('project-1');
    expect(anomalyCountArgs.where.detectedAt.gte).toBeInstanceOf(Date);
    expect(result.summary).toMatchObject({
      periodHours: 24,
      totalRequests: 20,
      totalEndpoints: 2,
      avgLatency: 150,
      p95Latency: 300,
      errorRate: 20,
      availability: 80,
      anomalyCount: 3,
    });
    expect(result.summary?.generatedAt).toEqual(expect.any(String));
    expect(result.endpoints).toEqual([
      {
        endpoint: '/checkout',
        avgLatency: 200,
        p95Latency: 300,
        p99Latency: 300,
        peakLatency: 300,
        totalRequests: 14,
        errorRate: 50,
        successRate: 50,
      },
      {
        endpoint: '/health',
        avgLatency: 50,
        p95Latency: 50,
        p99Latency: 50,
        peakLatency: 50,
        totalRequests: 6,
        errorRate: 0,
        successRate: 100,
      },
    ]);
  });

  it('returns a no-data message for csv export when the report is empty', async () => {
    jest.spyOn(service, 'generateReportData').mockResolvedValue({
      summary: null,
      endpoints: [],
    });

    await expect(service.exportCsv('project-1', 12)).resolves.toBe(
      'No data available for the selected period.',
    );
  });

  it('prepends report headers to csv export data', async () => {
    jest.spyOn(service, 'generateReportData').mockResolvedValue({
      summary: {
        periodHours: 24,
        generatedAt: '2026-09-29T12:00:00.000Z',
        totalRequests: 20,
        totalEndpoints: 2,
        avgLatency: 150,
        p95Latency: 300,
        errorRate: 20,
        availability: 80,
        anomalyCount: 3,
      },
      endpoints: [
        {
          endpoint: '/checkout',
          avgLatency: 200,
          p95Latency: 300,
          p99Latency: 300,
          peakLatency: 300,
          totalRequests: 14,
          errorRate: 50,
          successRate: 50,
        },
      ],
    });

    const result = await service.exportCsv('project-1', 24);

    expect(mockParse.mock.calls).toEqual([
      [
        [
          {
            endpoint: '/checkout',
            avgLatency: 200,
            p95Latency: 300,
            p99Latency: 300,
            peakLatency: 300,
            totalRequests: 14,
            errorRate: 50,
            successRate: 50,
          },
        ],
      ],
    ]);
    expect(result).toContain('# Performance Report - Last 24 hours');
    expect(result).toContain('# Availability: 80%');
    expect(result).toContain('endpoint,avgLatency');
  });

  it('exports json using generated report data', async () => {
    const report = {
      summary: {
        periodHours: 24,
      },
      endpoints: [],
    };

    jest
      .spyOn(service, 'generateReportData')
      .mockResolvedValue(report as never);

    await expect(service.exportJson('project-1', 24)).resolves.toBe(report);
  });

  it('delegates legacy exportReport calls to exportCsv', async () => {
    const exportCsvSpy = jest
      .spyOn(service, 'exportCsv')
      .mockResolvedValue('csv-content');

    await expect(service.exportReport('project-1', 48)).resolves.toBe(
      'csv-content',
    );
    expect(exportCsvSpy).toHaveBeenCalledWith('project-1', 48);
  });
});
