import { IsInt, IsString, Min } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateMetricDto {
  @ApiProperty({
    example: '/api/payments',
    description: 'API endpoint being monitored',
  })
  @IsString()
  endpoint!: string;

  @ApiProperty({
    example: 245,
    description: 'Response latency in milliseconds',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  latency!: number;

  @ApiProperty({
    example: 150,
    description: 'Number of requests represented by this metric record',
  })
  @IsInt()
  requests!: number;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code returned by the endpoint',
  })
  @IsInt()
  statusCode!: number;
}
