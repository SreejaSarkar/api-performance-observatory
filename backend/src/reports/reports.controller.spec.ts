import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: jest.Mocked<ReportsService>;

  const request = {
    project: {
      id: 'project-1',
    },
  } as unknown as Parameters<ReportsController['export']>[0];

  function createResponse() {
    return {
      setHeader: jest.fn(),
      send: jest.fn(),
    };
  }

  beforeEach(() => {
    reportsService = {
      exportCsv: jest.fn(),
      exportJson: jest.fn(),
      exportPdf: jest.fn(),
    } as unknown as jest.Mocked<ReportsService>;

    controller = new ReportsController(reportsService);
  });

  it('exports json reports with the expected headers', async () => {
    const response = createResponse();
    const payload = { summary: { totalRequests: 10 } };

    reportsService.exportJson.mockResolvedValue(payload as never);
    response.send.mockReturnValue('sent-json');

    await expect(
      controller.export(request, response as never, '24', 'json'),
    ).resolves.toBe('sent-json');

    expect(reportsService.exportJson.mock.calls).toEqual([['project-1', 24]]);
    expect(response.setHeader.mock.calls).toEqual([
      ['Content-Type', 'application/json'],
      ['Content-Disposition', 'attachment; filename="report-24h.json"'],
    ]);
    expect(response.send.mock.calls).toEqual([[payload]]);
  });

  it('exports pdf reports with the expected headers', async () => {
    const response = createResponse();
    const payload = Buffer.from('pdf');

    reportsService.exportPdf.mockResolvedValue(payload);
    response.send.mockReturnValue('sent-pdf');

    await expect(
      controller.export(request, response as never, '12', 'pdf'),
    ).resolves.toBe('sent-pdf');

    expect(reportsService.exportPdf.mock.calls).toEqual([['project-1', 12]]);
    expect(response.setHeader.mock.calls).toEqual([
      ['Content-Type', 'application/pdf'],
      ['Content-Disposition', 'attachment; filename="report-12h.pdf"'],
    ]);
    expect(response.send.mock.calls).toEqual([[payload]]);
  });

  it('defaults to csv export and a 72 hour window', async () => {
    const response = createResponse();

    reportsService.exportCsv.mockResolvedValue('csv-data');
    response.send.mockReturnValue('sent-csv');

    await expect(
      controller.export(request, response as never, undefined, 'invalid'),
    ).resolves.toBe('sent-csv');

    expect(reportsService.exportCsv.mock.calls).toEqual([['project-1', 72]]);
    expect(response.setHeader.mock.calls).toEqual([
      ['Content-Type', 'text/csv'],
      ['Content-Disposition', 'attachment; filename="report-72h.csv"'],
    ]);
    expect(response.send.mock.calls).toEqual([['csv-data']]);
  });
});
