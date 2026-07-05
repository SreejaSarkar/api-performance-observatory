import {
  ApiProperty,
} from "@nestjs/swagger";

import {
  ValidateNested,
} from "class-validator";

import {
  Type,
} from "class-transformer";

import {
  CreateMetricDto,
} from "./create-metric.dto";

export class BatchMetricDto {
  @ApiProperty({
    description:
      "List of metrics to ingest in a single request",
    type: [CreateMetricDto],
    example: [
      {
        endpoint:
          "/api/payments",
        latency: 120,
        requests: 50,
        statusCode: 200,
      },
      {
        endpoint:
          "/api/orders",
        latency: 850,
        requests: 10,
        statusCode: 500,
      },
    ],
  })
  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      CreateMetricDto,
  )
  metrics!: CreateMetricDto[];
}