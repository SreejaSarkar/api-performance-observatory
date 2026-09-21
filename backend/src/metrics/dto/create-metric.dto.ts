import { Type } from 'class-transformer';

import {
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateMetricDto {
  @ApiProperty({
    example: '/api/payments',
    description: 'API endpoint being monitored',
  })
  @IsString()
  endpoint!: string;

  @ApiProperty({
    example: 'GET',
    description: 'HTTP method used for the request',
    required: false,
  })
  @IsOptional()
  @IsString()
  method?: string;

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
  @Min(1)
  requests!: number;

  @ApiProperty({
    example: 200,
    description: 'HTTP status code returned by the endpoint',
  })
  @IsInt()
  statusCode!: number;

  @ApiProperty({
    example: '2026-09-19T10:20:30.000Z',
    description: 'Original metric timestamp in ISO-8601 format',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({
    example: 'req_01J8Q4N6YKPJQJ6BKHYQX6JQ4R',
    description: 'Application request identifier for correlation',
    required: false,
  })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiProperty({
    example: 2048,
    description: 'Response body size in bytes',
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  responseSize?: number;

  @ApiProperty({
    example: 'curl/8.8.0',
    description: 'Request user agent when available',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    example: 'production',
    description: 'Application environment label for the metric',
    required: false,
  })
  @IsOptional()
  @IsString()
  environment?: string;

  @ApiProperty({
    example: { service: 'payments-api', region: 'us-east-1' },
    description: 'Additional non-sensitive metric context',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
