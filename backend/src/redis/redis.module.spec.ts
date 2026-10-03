import { MODULE_METADATA } from '@nestjs/common/constants';

import { RedisModule } from './redis.module';
import { RedisService } from './redis.service';

describe('RedisModule', () => {
  it('registers the expected module metadata', () => {
    expect(Reflect.getMetadata(MODULE_METADATA.PROVIDERS, RedisModule)).toEqual(
      [RedisService],
    );
    expect(Reflect.getMetadata(MODULE_METADATA.EXPORTS, RedisModule)).toEqual([
      RedisService,
    ]);
  });
});
