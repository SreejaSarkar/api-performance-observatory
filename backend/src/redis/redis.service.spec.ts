import { EventEmitter } from 'events';

import { RedisService } from './redis.service';

describe('RedisService', () => {
  let service: RedisService;
  let redis: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
    ping: jest.Mock;
    scanStream: jest.Mock;
    pipeline: jest.Mock;
  };

  beforeEach(() => {
    service = Object.create(RedisService.prototype) as RedisService;
    redis = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      ping: jest.fn(),
      scanStream: jest.fn(),
      pipeline: jest.fn(),
    };

    (service as unknown as { redis: typeof redis }).redis = redis;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('gets a value by key', async () => {
    redis.get.mockResolvedValue('cached-value');

    await expect(service.get('cache-key')).resolves.toBe('cached-value');
    expect(redis.get.mock.calls).toEqual([['cache-key']]);
  });

  it('sets a value with ttl', async () => {
    redis.set.mockResolvedValue('OK');

    await expect(service.set('cache-key', 'payload', 60)).resolves.toBe('OK');
    expect(redis.set.mock.calls).toEqual([['cache-key', 'payload', 'EX', 60]]);
  });

  it('deletes a single key', async () => {
    redis.del.mockResolvedValue(1);

    await expect(service.del('cache-key')).resolves.toBe(1);
    expect(redis.del.mock.calls).toEqual([['cache-key']]);
  });

  it('pings redis', async () => {
    redis.ping.mockResolvedValue('PONG');

    await expect(service.ping()).resolves.toBe('PONG');
    expect(redis.ping.mock.calls).toEqual([[]]);
  });

  it('deletes all keys found by prefix scan', async () => {
    const stream = new EventEmitter();
    const del = jest.fn();
    const exec = jest.fn().mockResolvedValue([]);

    redis.scanStream.mockReturnValue(stream);
    redis.pipeline.mockReturnValue({ del, exec });

    const deletion = service.delByPrefix('metrics-summary:project-1:');

    stream.emit('data', ['key-1', 'key-2']);
    stream.emit('end');

    await expect(deletion).resolves.toBeUndefined();
    expect(redis.scanStream.mock.calls).toEqual([
      [{ match: 'metrics-summary:project-1:*', count: 100 }],
    ]);
    expect(del).toHaveBeenCalledTimes(2);
    expect(del).toHaveBeenNthCalledWith(1, 'key-1');
    expect(del).toHaveBeenNthCalledWith(2, 'key-2');
    expect(exec).toHaveBeenCalledTimes(1);
  });

  it('rejects when the scan stream errors', async () => {
    const stream = new EventEmitter();
    const exec = jest.fn();

    redis.scanStream.mockReturnValue(stream);
    redis.pipeline.mockReturnValue({
      del: jest.fn(),
      exec,
    });

    const deletion = service.delByPrefix('metrics-summary:project-1:');
    const error = new Error('scan failed');

    stream.emit('error', error);

    await expect(deletion).rejects.toThrow('scan failed');
    expect(exec).not.toHaveBeenCalled();
  });
});
