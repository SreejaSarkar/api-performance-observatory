import { MetricsGateway } from './metrics.gateway';

describe('MetricsGateway', () => {
  let gateway: MetricsGateway;

  beforeEach(() => {
    gateway = new MetricsGateway();
    gateway.server = {
      emit: jest.fn(),
    } as never;
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('emits metrics on the project-specific channel', () => {
    gateway.emitMetric('project-1', { latency: 120 });

    const emit = gateway.server.emit as jest.Mock;

    expect(emit.mock.calls).toEqual([
      ['project:project-1', { latency: 120 }],
    ]);
  });
});
