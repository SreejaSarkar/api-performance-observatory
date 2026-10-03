import { AnomaliesController } from './anomalies.controller';
import { AnomaliesService } from './anomalies.service';

describe('AnomaliesController', () => {
  let controller: AnomaliesController;
  let anomaliesService: jest.Mocked<AnomaliesService>;

  beforeEach(() => {
    anomaliesService = {
      getHistory: jest.fn(),
      getActive: jest.fn(),
    } as unknown as jest.Mocked<AnomaliesService>;

    controller = new AnomaliesController(anomaliesService);
  });

  it('returns history for the request project', async () => {
    await controller.getHistory({ project: { id: 'project-1' } } as never);

    expect(anomaliesService.getHistory.mock.calls).toEqual([['project-1']]);
  });
});
